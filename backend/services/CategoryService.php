<?php
/**
 * Kategori Servisi - MySQL Versiyonu
 * Firebase categoryService.js'in PHP PDO ile yeniden yazılmış hali
 */

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class CategoryService
{
    private $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    /**
     * Yeni kategori ekler
     * @param array $categoryData - Kategori bilgileri
     * @return array - Eklenen kategori bilgileri
     */
    public function addCategory($categoryData)
    {
        try {
            // Validation
            $this->validateCategoryData($categoryData);

            // Kategori adı kontrolü
            if ($this->isCategoryNameTaken($categoryData['kategoriAdi'])) {
                ResponseHandler::error('Bu kategori adı zaten kullanılıyor', 400);
            }

            $sql = "INSERT INTO kategoriler (kategori_adi, aciklama, durum, created_at) 
                    VALUES (:kategori_adi, :aciklama, :durum, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':kategori_adi' => $categoryData['kategoriAdi'],
                ':aciklama' => $categoryData['aciklama'] ?? null,
                ':durum' => $categoryData['durum'] ?? 'aktif'
            ]);

            $categoryId = $this->db->lastInsertId();

            // Log kaydı
            $this->addLog('Yeni Kategori Eklendi', "{$categoryData['kategoriAdi']} adlı kategori eklendi.");

            // Eklenen kategoriyi getir
            $addedCategory = $this->getCategoryById($categoryId);

            ResponseHandler::success($addedCategory, 'Kategori başarıyla eklendi', 201);

        } catch (Exception $e) {
            ResponseHandler::error('Kategori eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategori adı daha önce alınmış mı kontrol eder
     * @param string $kategoriAdi - Kontrol edilecek kategori adı
     * @return bool - true: alınmış, false: alınmamış
     */
    public function isCategoryNameTaken($kategoriAdi)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM kategoriler WHERE kategori_adi = :kategori_adi";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':kategori_adi' => $kategoriAdi]);

            $result = $stmt->fetch();
            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Aktif kategorileri sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Sayfalı kategoriler listesi
     */
    public function getCategoriesPaginated($page = 1, $pageSize = 6, $search = "")
    {
        try {
            $offset = ($page - 1) * $pageSize;
            $whereClause = "WHERE durum = 'aktif'";
            $params = [];

            // Arama terimi varsa WHERE koşulu ekle
            if (!empty($search)) {
                $whereClause .= " AND (kategori_adi LIKE :search OR aciklama LIKE :search)";
                $params[':search'] = "%{$search}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM kategoriler {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT * FROM kategoriler {$whereClause} ORDER BY kategori_adi ASC LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);

            // Arama parametrelerini bind et
            if (!empty($params)) {
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value);
                }
            }

            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $categories = $stmt->fetchAll();

            $result = [
                'categories' => $categories,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            ResponseHandler::success($result, 'Kategoriler başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategoriler getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Tüm kategorileri (aktif+pasif) sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Sayfalı kategoriler listesi
     */
    public function getAllCategoriesPaginated($page = 1, $pageSize = 6, $search = "")
    {
        try {
            $offset = ($page - 1) * $pageSize;
            $whereClause = "";
            $params = [];

            // Arama terimi varsa WHERE koşulu ekle
            if (!empty($search)) {
                $whereClause = "WHERE kategori_adi LIKE :search OR aciklama LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM kategoriler {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT * FROM kategoriler {$whereClause} ORDER BY kategori_adi ASC LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);

            // Arama parametrelerini bind et
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $categories = $stmt->fetchAll();

            $result = [
                'categories' => $categories,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            ResponseHandler::success($result, 'Tüm kategoriler başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategoriler getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * ID'ye göre kategori getirir
     * @param int $categoryId - Kategori ID'si
     * @return array - Kategori bilgileri
     */
    public function getCategoryById($categoryId)
    {
        try {
            $sql = "SELECT * FROM kategoriler WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $categoryId]);

            $category = $stmt->fetch();

            if (!$category) {
                ResponseHandler::notFound('Kategori bulunamadı');
            }

            return $category;

        } catch (Exception $e) {
            ResponseHandler::error('Kategori getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategori günceller
     * @param int $categoryId - Kategori ID'si
     * @param array $categoryData - Güncellenecek veriler
     * @return array - Güncellenmiş kategori bilgileri
     */
    public function updateCategory($categoryId, $categoryData)
    {
        try {
            // Kategorinin var olup olmadığını kontrol et
            $existingCategory = $this->getCategoryById($categoryId);

            // Kategori adı değişiyorsa benzersizlik kontrolü
            if (
                isset($categoryData['kategoriAdi']) &&
                $categoryData['kategoriAdi'] !== $existingCategory['kategori_adi'] &&
                $this->isCategoryNameTaken($categoryData['kategoriAdi'])
            ) {
                ResponseHandler::error('Bu kategori adı zaten kullanılıyor', 400);
            }

            $updateFields = [];
            $params = [':id' => $categoryId];

            // Güncellenecek alanları hazırla
            $fieldMappings = [
                'kategoriAdi' => 'kategori_adi',
                'aciklama' => 'aciklama',
                'durum' => 'durum'
            ];

            foreach ($fieldMappings as $inputField => $dbField) {
                if (isset($categoryData[$inputField])) {
                    $updateFields[] = "{$dbField} = :{$dbField}";
                    $params[":{$dbField}"] = $categoryData[$inputField];
                }
            }

            if (empty($updateFields)) {
                ResponseHandler::error('Güncellenecek alan bulunamadı');
            }

            $sql = "UPDATE kategoriler SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // Log kaydı
            $this->addLog('Kategori Güncellendi', "{$categoryData['kategoriAdi']} adlı kategori güncellendi.");

            // Güncellenmiş kategoriyi getir
            $updatedCategory = $this->getCategoryById($categoryId);

            ResponseHandler::success($updatedCategory, 'Kategori başarıyla güncellendi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategori güncellenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategori siler
     * @param int $categoryId - Kategori ID'si
     * @return void
     */
    public function deleteCategory($categoryId)
    {
        try {
            // Kategorinin var olup olmadığını kontrol et
            $existingCategory = $this->getCategoryById($categoryId);

            $sql = "DELETE FROM kategoriler WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $categoryId]);

            // Log kaydı
            $this->addLog('Kategori Silindi', "{$existingCategory['kategori_adi']} adlı kategori silindi.");

            ResponseHandler::success(null, 'Kategori başarıyla silindi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategori silinirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategoriyi pasif yapar
     * @param int $categoryId - Kategori ID'si
     * @return void
     */
    public function setCategoryPassive($categoryId)
    {
        try {
            $existingCategory = $this->getCategoryById($categoryId);

            $sql = "UPDATE kategoriler SET durum = 'pasif' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $categoryId]);

            // Log kaydı
            $this->addLog('Kategori Pasif Yapıldı', "{$existingCategory['kategori_adi']} adlı kategori pasif yapıldı.");

            ResponseHandler::success(null, 'Kategori pasif yapıldı');

        } catch (Exception $e) {
            ResponseHandler::error('Kategori pasif yapılırken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategoriyi aktif yapar
     * @param int $categoryId - Kategori ID'si
     * @return void
     */
    public function setCategoryActive($categoryId)
    {
        try {
            $existingCategory = $this->getCategoryById($categoryId);

            $sql = "UPDATE kategoriler SET durum = 'aktif' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $categoryId]);

            // Log kaydı
            $this->addLog('Kategori Aktif Yapıldı', "{$existingCategory['kategori_adi']} adlı kategori aktif yapıldı.");

            ResponseHandler::success(null, 'Kategori aktif yapıldı');

        } catch (Exception $e) {
            ResponseHandler::error('Kategori aktif yapılırken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Tüm aktif kategorileri getirir (sayfalama olmadan)
     * @return array - Aktif kategoriler listesi
     */
    public function getAllActiveCategories()
    {
        try {
            $sql = "SELECT * FROM kategoriler WHERE durum = 'aktif' ORDER BY kategori_adi ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();

            $categories = $stmt->fetchAll();

            ResponseHandler::success($categories, 'Aktif kategoriler başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategoriler getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategori adına göre soru sayısını getirir
     * @param string $categoryName - Kategori adı
     * @return int - Soru sayısı
     */
    public function getQuestionCountByCategoryName($categoryName)
    {
        try {
            $sql = "SELECT COUNT(*) as question_count FROM sorular s 
                    INNER JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE k.kategori_adi = :category_name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':category_name' => $categoryName]);

            $result = $stmt->fetch();
            return (int) $result['question_count'];

        } catch (Exception $e) {
            throw new Exception('Kategori soru sayısı getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategori verilerini validate eder
     * @param array $categoryData - Kategori verileri
     * @throws Exception - Validation hatası
     */
    private function validateCategoryData($categoryData)
    {
        $errors = [];

        if (empty($categoryData['kategoriAdi'])) {
            $errors[] = 'Kategori adı zorunludur';
        }

        if (strlen($categoryData['kategoriAdi']) > 100) {
            $errors[] = 'Kategori adı en fazla 100 karakter olabilir';
        }

        if (!empty($errors)) {
            ResponseHandler::validationError($errors);
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