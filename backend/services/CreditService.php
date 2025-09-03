<?php
/**
 * Kredi Servisi - MySQL Versiyonu
 * Kredi işlemleri için CRUD operasyonları
 */

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class CreditService
{
    private $db;

    public function __construct($database = null)
    {
        if ($database) {
            $this->db = $database->getConnection();
        } else {
            $this->db = getDB();
        }
    }

    /**
     * Yeni kredi kaydı ekler
     * @param array $creditData - Kredi bilgileri
     * @return array - Eklenen kredi bilgileri
     */
    public function addCredit($creditData)
    {
        try {
            // Validation
            $this->validateCreditData($creditData);

            $sql = "INSERT INTO krediler (okul_adi, kredi_miktari, aciklama, durum, created_at) 
                    VALUES (:okul_adi, :kredi_miktari, :aciklama, :durum, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':okul_adi' => $creditData['okulAdi'],
                ':kredi_miktari' => $creditData['krediMiktari'],
                ':aciklama' => $creditData['aciklama'] ?? null,
                ':durum' => $creditData['durum'] ?? 'aktif'
            ]);

            $creditId = $this->db->lastInsertId();

            // Eklenen krediyi getir
            $addedCredit = $this->getCreditById($creditId);

            return $addedCredit;

        } catch (Exception $e) {
            throw new Exception('Kredi eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Okula kredi ekler veya çıkarır (okullar tablosundaki kredi alanını günceller ve krediler tablosuna kayıt ekler)
     * @param int $schoolId - Okul ID'si
     * @param int $creditAmount - Eklenecek/çıkarılacak kredi miktarı (pozitif: ekleme, negatif: çıkarma)
     * @return array - Güncellenmiş okul bilgileri
     */
    public function addCreditToSchool($schoolId, $creditAmount)
    {
        try {
            // Transaction başlat
            $this->db->beginTransaction();

            // Okulun var olup olmadığını kontrol et
            $stmt = $this->db->prepare("SELECT id, okul_adi, kredi FROM okullar WHERE id = :id");
            $stmt->execute([':id' => $schoolId]);
            $school = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$school) {
                throw new Exception('Okul bulunamadı');
            }

            // Mevcut kredi miktarını al
            $currentCredit = (int) ($school['kredi'] ?? 0);
            $newCredit = $currentCredit + $creditAmount;

            // Kredi 0'dan küçük olamaz
            if ($newCredit < 0) {
                throw new Exception('Kredi miktarı 0\'dan küçük olamaz');
            }

            // 1. Okulun kredi alanını güncelle
            $updateSql = "UPDATE okullar SET kredi = :kredi, updated_at = NOW() WHERE id = :id";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([
                ':kredi' => $newCredit,
                ':id' => $schoolId
            ]);

            // 2. Krediler tablosuna kayıt ekle
            $actionText = $creditAmount > 0 ? 'eklendi' : 'çıkarıldı';
            $actionAmount = abs($creditAmount);

            $insertSql = "INSERT INTO krediler (okul_adi, kredi_miktari, aciklama, durum, created_at) 
                         VALUES (:okul_adi, :kredi_miktari, :aciklama, :durum, NOW())";
            $insertStmt = $this->db->prepare($insertSql);
            $insertStmt->execute([
                ':okul_adi' => $school['okul_adi'],
                ':kredi_miktari' => $creditAmount, // Negatif değer çıkarma, pozitif değer ekleme
                ':aciklama' => "Okula kredi {$actionText} - Eski: {$currentCredit}, Yeni: {$newCredit}",
                ':durum' => 'aktif'
            ]);

            // Transaction'ı onayla
            $this->db->commit();

            // Güncellenmiş okul bilgilerini getir
            $stmt = $this->db->prepare("SELECT * FROM okullar WHERE id = :id");
            $stmt->execute([':id' => $schoolId]);
            $updatedSchool = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'message' => "{$school['okul_adi']} için {$actionAmount} kredi {$actionText}. Yeni kredi: {$newCredit}",
                'data' => $updatedSchool,
                'oldCredit' => $currentCredit,
                'newCredit' => $newCredit,
                'addedCredit' => $creditAmount
            ];

        } catch (Exception $e) {
            // Hata durumunda transaction'ı geri al
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new Exception('Kredi eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kredileri sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Sayfalı krediler listesi
     */
    public function getCreditsPaginated($page = 1, $pageSize = 6, $search = "")
    {
        try {
            $offset = ($page - 1) * $pageSize;
            $whereClause = "";
            $params = [];

            // Arama terimi varsa WHERE koşulu ekle
            if (!empty($search)) {
                $whereClause = "WHERE okul_adi LIKE :search OR aciklama LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM krediler {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT * FROM krediler {$whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);

            // Arama parametrelerini bind et
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $credits = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Pagination bilgilerini hesapla
            $hasMore = ($offset + $pageSize) < $totalCount;

            $result = [
                'credits' => $credits,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'has_more' => $hasMore
                ]
            ];

            ResponseHandler::success($result, 'Krediler başarıyla getirildi');

        } catch (Exception $e) {
            throw new Exception('Krediler getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kredi ID ile getirme
     * @param int $creditId - Kredi ID
     * @return array - Kredi bilgileri
     */
    public function getCreditById($creditId)
    {
        try {
            $sql = "SELECT * FROM krediler WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $creditId]);

            $credit = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$credit) {
                throw new Exception('Kredi bulunamadı');
            }

            return $credit;

        } catch (Exception $e) {
            throw new Exception('Kredi getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kredi güncelleme
     * @param int $creditId - Kredi ID
     * @param array $creditData - Güncellenecek kredi bilgileri
     * @return array - Güncellenmiş kredi bilgileri
     */
    public function updateCredit($creditId, $creditData)
    {
        try {
            // Mevcut krediyi kontrol et
            $existingCredit = $this->getCreditById($creditId);

            $updateFields = [];
            $params = [':id' => $creditId];

            // Güncellenecek alanları belirle
            if (isset($creditData['okulAdi'])) {
                $updateFields[] = "okul_adi = :okul_adi";
                $params[':okul_adi'] = $creditData['okulAdi'];
            }

            if (isset($creditData['krediMiktari'])) {
                $updateFields[] = "kredi_miktari = :kredi_miktari";
                $params[':kredi_miktari'] = $creditData['krediMiktari'];
            }

            if (isset($creditData['aciklama'])) {
                $updateFields[] = "aciklama = :aciklama";
                $params[':aciklama'] = $creditData['aciklama'];
            }

            if (isset($creditData['durum'])) {
                $updateFields[] = "durum = :durum";
                $params[':durum'] = $creditData['durum'];
            }

            if (empty($updateFields)) {
                throw new Exception('Güncellenecek alan bulunamadı');
            }

            $sql = "UPDATE krediler SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() > 0) {
                // Güncellenmiş krediyi getir
                $updatedCredit = $this->getCreditById($creditId);
                return $updatedCredit;
            } else {
                throw new Exception('Kredi güncellenemedi');
            }

        } catch (Exception $e) {
            throw new Exception('Kredi güncellenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kredi silme
     * @param int $creditId - Kredi ID
     * @return array - Silme sonucu
     */
    public function deleteCredit($creditId)
    {
        try {
            // Mevcut krediyi kontrol et
            $existingCredit = $this->getCreditById($creditId);

            $sql = "DELETE FROM krediler WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $creditId]);

            if ($stmt->rowCount() > 0) {
                return ['message' => 'Kredi başarıyla silindi'];
            } else {
                throw new Exception('Kredi silinemedi');
            }

        } catch (Exception $e) {
            throw new Exception('Kredi silinirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Tüm aktif kredileri getirme
     * @return array - Aktif krediler listesi
     */
    public function getAllActiveCredits()
    {
        try {
            $sql = "SELECT * FROM krediler WHERE durum = 'aktif' ORDER BY created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            $credits = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $credits;

        } catch (Exception $e) {
            throw new Exception('Aktif krediler getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kredi verilerini doğrulama
     * @param array $creditData - Kredi bilgileri
     * @throws Exception - Doğrulama hatası
     */
    private function validateCreditData($creditData)
    {
        if (empty($creditData['okulAdi'])) {
            throw new Exception('Okul adı gereklidir');
        }

        if (!isset($creditData['krediMiktari']) || $creditData['krediMiktari'] <= 0) {
            throw new Exception('Geçerli bir kredi miktarı gereklidir');
        }

        if (isset($creditData['durum']) && !in_array($creditData['durum'], ['aktif', 'pasif'])) {
            throw new Exception('Geçersiz durum değeri');
        }
    }
}
?>