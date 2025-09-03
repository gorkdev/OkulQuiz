<?php
/**
 * Okul Servisi - MySQL Versiyonu
 * Firebase schoolService.js'in PHP PDO ile yeniden yazılmış hali
 */

// Hata ayıklama ayarları
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class SchoolService
{
    private $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    /**
     * Yeni okul ekler
     * @param array $schoolData - Okul bilgileri
     * @return array - Eklenen okul bilgileri
     */
    public function addSchool($schoolData)
    {
        try {
            // Validation
            $this->validateSchoolData($schoolData);

            // Kullanıcı adı kontrolü
            if ($this->isUsernameTaken($schoolData['kullaniciAdi'])) {
                throw new Exception('Bu kullanıcı adı zaten kullanılıyor');
            }

            // E-posta kontrolü
            if ($this->isEmailTaken($schoolData['eposta'])) {
                throw new Exception('Bu e-posta adresi zaten kullanılıyor');
            }

            // Telefon kontrolü
            if ($this->isPhoneTaken($schoolData['telefon'])) {
                throw new Exception('Bu telefon numarası zaten kullanılıyor');
            }

            $sql = "INSERT INTO okullar (
                okul_adi, okul_turu, adres, ilce, il, eposta, telefon, 
                website, ogrenci_sayisi, gorusulecek_yetkili, yetkili_telefon,
                durum, kullanici_adi, sifre
            ) VALUES (
                :okul_adi, :okul_turu, :adres, :ilce, :il, :eposta, :telefon,
                :website, :ogrenci_sayisi, :gorusulecek_yetkili, :yetkili_telefon,
                :durum, :kullanici_adi, :sifre
            )";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':okul_adi' => $schoolData['okulAdi'],
                ':okul_turu' => $schoolData['okulTuru'],
                ':adres' => $schoolData['adres'],
                ':ilce' => $schoolData['ilce'],
                ':il' => $schoolData['il'],
                ':eposta' => $schoolData['eposta'],
                ':telefon' => $schoolData['telefon'],
                ':website' => $schoolData['website'] ?? null,
                ':ogrenci_sayisi' => $schoolData['ogrenciSayisi'],
                ':gorusulecek_yetkili' => $schoolData['gorusulecekYetkili'] ?? null,
                ':yetkili_telefon' => $schoolData['yetkiliTelefon'] ?? null,
                ':durum' => $schoolData['durum'] ?? 'aktif',
                ':kullanici_adi' => $schoolData['kullaniciAdi'],
                ':sifre' => $schoolData['sifre']
            ]);

            $schoolId = $this->db->lastInsertId();

            // Log kaydı
            $this->addLog('Yeni Bir Okul Eklendi', "{$schoolData['okulAdi']} adlı okul sisteme eklendi.");

            // Eklenen okulu getir
            $addedSchool = $this->getSchoolById($schoolId);

            return $addedSchool;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Tüm okulları getirir
     * @param int $limit - Limit
     * @param int $offset - Offset
     * @return array - Okullar listesi
     */
    public function getSchools($limit = null, $offset = 0)
    {
        try {
            $sql = "SELECT * FROM okullar ORDER BY created_at DESC";

            if ($limit) {
                $sql .= " LIMIT :limit OFFSET :offset";
            }

            $stmt = $this->db->prepare($sql);

            if ($limit) {
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            }

            $stmt->execute();
            $schools = $stmt->fetchAll();

            // Log kaydı
            $this->addLog('Okul Listelendi', 'Okul listesi getirildi.');

            return $schools;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }



    /**
     * ID'ye göre okul getirir
     * @param int $schoolId - Okul ID'si
     * @return array - Okul bilgileri
     */
    public function getSchoolById($schoolId)
    {
        try {
            $sql = "SELECT * FROM okullar WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $schoolId]);

            $school = $stmt->fetch();

            if (!$school) {
                throw new Exception('Okul bulunamadı');
            }

            return $school;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Okul günceller
     * @param int $schoolId - Okul ID'si
     * @param array $schoolData - Güncellenecek veriler
     * @return array - Güncellenmiş okul bilgileri
     */
    public function updateSchool($schoolId, $schoolData)
    {
        try {
            // Okulun var olup olmadığını kontrol et
            $existingSchool = $this->getSchoolById($schoolId);

            // Debug: Gelen veriyi logla
            error_log("UPDATE SCHOOL DEBUG - School ID: " . $schoolId);
            error_log("UPDATE SCHOOL DEBUG - Received data: " . json_encode($schoolData));
            error_log("UPDATE SCHOOL DEBUG - Existing school: " . json_encode($existingSchool));

            // Kullanıcı adı değişiyorsa benzersizlik kontrolü
            if (
                isset($schoolData['kullaniciAdi']) &&
                $schoolData['kullaniciAdi'] !== $existingSchool['kullanici_adi'] &&
                $this->isUsernameTaken($schoolData['kullaniciAdi'])
            ) {
                throw new Exception('Bu kullanıcı adı zaten kullanılıyor');
            }

            // E-posta değişiyorsa benzersizlik kontrolü
            if (
                isset($schoolData['eposta']) &&
                $schoolData['eposta'] !== $existingSchool['eposta'] &&
                $this->isEmailTaken($schoolData['eposta'])
            ) {
                throw new Exception('Bu e-posta adresi zaten kullanılıyor');
            }

            // Telefon değişiyorsa benzersizlik kontrolü
            if (
                isset($schoolData['telefon']) &&
                $schoolData['telefon'] !== $existingSchool['telefon'] &&
                $this->isPhoneTaken($schoolData['telefon'])
            ) {
                throw new Exception('Bu telefon numarası zaten kullanılıyor');
            }

            $updateFields = [];
            $params = [':id' => $schoolId];

            // Güncellenecek alanları hazırla
            $fieldMappings = [
                'okulAdi' => 'okul_adi',
                'okulTuru' => 'okul_turu',
                'adres' => 'adres',
                'ilce' => 'ilce',
                'il' => 'il',
                'eposta' => 'eposta',
                'telefon' => 'telefon',
                'website' => 'website',
                'ogrenciSayisi' => 'ogrenci_sayisi',
                'kredi' => 'kredi',
                'gorusulecekYetkili' => 'gorusulecek_yetkili',
                'yetkiliTelefon' => 'yetkili_telefon',
                'kullaniciAdi' => 'kullanici_adi',
                'durum' => 'durum'
            ];

            // Debug: Field mappings ve gelen veriyi logla
            error_log("UPDATE SCHOOL DEBUG - Field mappings: " . json_encode($fieldMappings));
            error_log("UPDATE SCHOOL DEBUG - Input fields: " . json_encode(array_keys($schoolData)));

            foreach ($fieldMappings as $inputField => $dbField) {
                if (isset($schoolData[$inputField])) {
                    $updateFields[] = "{$dbField} = :{$dbField}";
                    $params[":{$dbField}"] = $schoolData[$inputField];
                    error_log("UPDATE SCHOOL DEBUG - Field will be updated: {$inputField} => {$dbField} = {$schoolData[$inputField]}");
                } else {
                    error_log("UPDATE SCHOOL DEBUG - Field not found in input: {$inputField}");
                }
            }

            // Şifre güncelleme
            if (isset($schoolData['sifre'])) {
                $updateFields[] = "sifre = :sifre";
                $params[':sifre'] = $schoolData['sifre'];
            }

            if (empty($updateFields)) {
                throw new Exception('Güncellenecek alan bulunamadı');
            }

            $sql = "UPDATE okullar SET " . implode(', ', $updateFields) . " WHERE id = :id";
            error_log("UPDATE SCHOOL DEBUG - SQL Query: " . $sql);
            error_log("UPDATE SCHOOL DEBUG - Parameters: " . json_encode($params));

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // Log kaydı
            $this->addLog('Okul Güncellendi', "{$schoolData['okulAdi']} adlı okul güncellendi.");

            // Güncellenmiş okulu getir
            $updatedSchool = $this->getSchoolById($schoolId);

            return $updatedSchool;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Okul siler
     * @param int $schoolId - Okul ID'si
     * @return void
     */
    public function deleteSchool($schoolId)
    {
        try {
            // Okulun var olup olmadığını kontrol et
            $existingSchool = $this->getSchoolById($schoolId);

            $sql = "DELETE FROM okullar WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $schoolId]);

            // Log kaydı
            $this->addLog('Okul Silindi', "{$existingSchool['okul_adi']} adlı okul silindi.");

            return true;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Okulları sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Sayfalı okullar listesi
     */
    public function getSchoolsPaginated($page = 1, $pageSize = 6, $search = "")
    {
        try {
            $offset = ($page - 1) * $pageSize;

            if (!empty($search)) {
                // Arama ile birlikte - her alan için ayrı parametre kullan
                $searchTerm = "%{$search}%";
                $sql = "SELECT * FROM okullar WHERE okul_adi LIKE :search1 OR il LIKE :search2 OR ilce LIKE :search3 OR eposta LIKE :search4 OR telefon LIKE :search5 ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
                $countSql = "SELECT COUNT(*) as total FROM okullar WHERE okul_adi LIKE :search1 OR il LIKE :search2 OR ilce LIKE :search3 OR eposta LIKE :search4 OR telefon LIKE :search5";

                // Toplam kayıt sayısını al
                $countStmt = $this->db->prepare($countSql);
                $countStmt->bindValue(':search1', $searchTerm);
                $countStmt->bindValue(':search2', $searchTerm);
                $countStmt->bindValue(':search3', $searchTerm);
                $countStmt->bindValue(':search4', $searchTerm);
                $countStmt->bindValue(':search5', $searchTerm);
                $countStmt->execute();
                $totalCount = $countStmt->fetch()['total'];

                // Sayfalı verileri al
                $stmt = $this->db->prepare($sql);
                $stmt->bindValue(':search1', $searchTerm);
                $stmt->bindValue(':search2', $searchTerm);
                $stmt->bindValue(':search3', $searchTerm);
                $stmt->bindValue(':search4', $searchTerm);
                $stmt->bindValue(':search5', $searchTerm);
                $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();

            } else {
                // Arama olmadan
                $sql = "SELECT * FROM okullar ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
                $countSql = "SELECT COUNT(*) as total FROM okullar";

                // Toplam kayıt sayısını al
                $countStmt = $this->db->prepare($countSql);
                $countStmt->execute();
                $totalCount = $countStmt->fetch()['total'];

                // Sayfalı verileri al
                $stmt = $this->db->prepare($sql);
                $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
            }

            $schools = $stmt->fetchAll();

            $result = [
                'schools' => $schools,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            return $result;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Kullanıcı adı daha önce alınmış mı kontrol eder
     * @param string $username - Kontrol edilecek kullanıcı adı
     * @return bool - true: alınmış, false: alınmamış
     */
    public function isUsernameTaken($username)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM okullar WHERE kullanici_adi = :username";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':username' => $username]);

            $result = $stmt->fetch();
            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * E-posta adresinin kullanılıp kullanılmadığını kontrol eder
     * @param string $email - E-posta adresi
     * @return bool - Kullanılıyorsa true, kullanılmıyorsa false
     */
    public function isEmailTaken($email)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM okullar WHERE eposta = :email";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':email' => $email]);

            $result = $stmt->fetch();
            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Telefon numarasının kullanılıp kullanılmadığını kontrol eder
     * @param string $phone - Telefon numarası
     * @return bool - Kullanılıyorsa true, kullanılmıyorsa false
     */
    public function isPhoneTaken($phone)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM okullar WHERE telefon = :phone";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':phone' => $phone]);

            $result = $stmt->fetch();
            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Okulu pasif yapar
     * @param int $schoolId - Okul ID'si
     * @return void
     */
    public function setSchoolPassive($schoolId)
    {
        try {
            $existingSchool = $this->getSchoolById($schoolId);

            $sql = "UPDATE okullar SET durum = 'pasif' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $schoolId]);

            // Log kaydı
            $this->addLog('Okul Pasif Yapıldı', "{$existingSchool['okul_adi']} adlı okul pasif yapıldı.");

            return true;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Okulu aktif yapar
     * @param int $schoolId - Okul ID'si
     * @return void
     */
    public function setSchoolActive($schoolId)
    {
        try {
            $existingSchool = $this->getSchoolById($schoolId);

            $sql = "UPDATE okullar SET durum = 'aktif' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $schoolId]);

            // Log kaydı
            $this->addLog('Okul Aktif Yapıldı', "{$existingSchool['okul_adi']} adlı okul aktif yapıldı.");

            return true;

        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    /**
     * Okul verilerini validate eder
     * @param array $schoolData - Okul verileri
     * @throws Exception - Validation hatası
     */
    private function validateSchoolData($schoolData)
    {
        $errors = [];

        if (empty($schoolData['okulAdi'])) {
            $errors[] = 'Okul adı zorunludur';
        }

        if (empty($schoolData['okulTuru'])) {
            $errors[] = 'Okul türü zorunludur';
        }

        if (empty($schoolData['adres'])) {
            $errors[] = 'Adres zorunludur';
        }

        if (empty($schoolData['ilce'])) {
            $errors[] = 'İlçe zorunludur';
        }

        if (empty($schoolData['il'])) {
            $errors[] = 'İl zorunludur';
        }

        if (empty($schoolData['eposta']) || !filter_var($schoolData['eposta'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Geçerli bir e-posta adresi girin';
        }

        if (empty($schoolData['telefon'])) {
            $errors[] = 'Telefon numarası zorunludur';
        }

        if (empty($schoolData['ogrenciSayisi'])) {
            $errors[] = 'Öğrenci sayısı zorunludur';
        }

        if (empty($schoolData['kullaniciAdi'])) {
            $errors[] = 'Kullanıcı adı zorunludur';
        }

        if (empty($schoolData['sifre']) || strlen($schoolData['sifre']) < 8) {
            $errors[] = 'Şifre en az 8 karakter olmalı';
        }

        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }
    }

    /**
     * Log kaydı ekler
     * @param string $title - Log başlığı
     * @param string $details - Log detayları
     */
    private function addLog($title, $details)
    {
        try {
            $sql = "INSERT INTO logs (title, details, created_at) VALUES (:title, :details, NOW())";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':title' => $title,
                ':details' => $details
            ]);
        } catch (Exception $e) {
            // Log hatası ana işlemi etkilemesin
            error_log("Log kaydı hatası: " . $e->getMessage());
        }
    }
}
?>