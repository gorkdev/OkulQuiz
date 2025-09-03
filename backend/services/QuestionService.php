<?php
/**
 * Soru Servisi - MySQL Versiyonu
 * Firebase questionService.js'in PHP PDO ile yeniden yazılmış hali
 */

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class QuestionService
{
    private $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    /**
     * Yeni soru ekler
     * @param array $questionData - Soru bilgileri
     * @return array - Eklenen soru bilgileri
     */
    public function addQuestion($questionData)
    {
        try {
            // Validation
            $this->validateQuestionData($questionData);

            $sql = "INSERT INTO sorular (
                kategori_id, soru_metni, secenek_a, secenek_b, secenek_c, secenek_d,
                dogru_cevap, aciklama, zorluk_seviyesi, resim_url, durum, created_at
            ) VALUES (
                :kategori_id, :soru_metni, :secenek_a, :secenek_b, :secenek_c, :secenek_d,
                :dogru_cevap, :aciklama, :zorluk_seviyesi, :resim_url, :durum, NOW()
            )";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':kategori_id' => $questionData['kategoriId'],
                ':soru_metni' => $questionData['soruMetni'],
                ':secenek_a' => $questionData['secenekA'],
                ':secenek_b' => $questionData['secenekB'],
                ':secenek_c' => $questionData['secenekC'],
                ':secenek_d' => $questionData['secenekD'],
                ':dogru_cevap' => $questionData['dogruCevap'],
                ':aciklama' => $questionData['aciklama'] ?? null,
                ':zorluk_seviyesi' => $questionData['zorlukSeviyesi'] ?? 'orta',
                ':resim_url' => $questionData['resimUrl'] ?? null,
                ':durum' => $questionData['durum'] ?? 'aktif'
            ]);

            $questionId = $this->db->lastInsertId();

            // Log kaydı
            $this->addLog('Yeni Soru Eklendi', "Yeni soru eklendi. ID: {$questionId}");

            // Eklenen soruyu getir
            $addedQuestion = $this->getQuestionById($questionId);

            ResponseHandler::success($addedQuestion, 'Soru başarıyla eklendi', 201);

        } catch (Exception $e) {
            ResponseHandler::error('Soru eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soruları sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Sayfalı sorular listesi
     */
    public function getQuestionsPaginated($page = 1, $pageSize = 10, $search = "")
    {
        try {
            $offset = ($page - 1) * $pageSize;
            $whereClause = "";
            $params = [];

            // Arama terimi varsa WHERE koşulu ekle
            if (!empty($search)) {
                $whereClause = "WHERE s.soru_metni LIKE :search 
                                OR s.secenek_a LIKE :search 
                                OR s.secenek_b LIKE :search 
                                OR s.secenek_c LIKE :search 
                                OR s.secenek_d LIKE :search 
                                OR k.kategori_adi LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM sorular s 
                        LEFT JOIN kategoriler k ON s.kategori_id = k.id {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al (kategori bilgileriyle birlikte)
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    {$whereClause}
                    ORDER BY s.created_at DESC 
                    LIMIT :limit OFFSET :offset";
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

            $questions = $stmt->fetchAll();

            $result = [
                'questions' => $questions,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            ResponseHandler::success($result, 'Sorular başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Sorular getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Sorularda arama yapar
     * @param string $search - Arama terimi
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @return array - Arama sonuçları
     */
    public function searchQuestions($search = '', $page = 1, $pageSize = 10)
    {
        try {
            $offset = ($page - 1) * $pageSize;

            if (empty($search)) {
                // Arama yoksa normal paginated çek
                return $this->getQuestionsPaginated($page, $pageSize);
            }

            $searchTerm = "%{$search}%";

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM sorular s 
                        LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                        WHERE s.soru_metni LIKE :search 
                        OR s.secenek_a LIKE :search 
                        OR s.secenek_b LIKE :search 
                        OR s.secenek_c LIKE :search 
                        OR s.secenek_d LIKE :search 
                        OR k.kategori_adi LIKE :search";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':search' => $searchTerm]);
            $totalCount = $countStmt->fetch()['total'];

            // Arama sonuçlarını al
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE s.soru_metni LIKE :search 
                    OR s.secenek_a LIKE :search 
                    OR s.secenek_b LIKE :search 
                    OR s.secenek_c LIKE :search 
                    OR s.secenek_d LIKE :search 
                    OR k.kategori_adi LIKE :search 
                    ORDER BY s.created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':search', $searchTerm);
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $questions = $stmt->fetchAll();

            $result = [
                'questions' => $questions,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ],
                'search_term' => $search
            ];

            ResponseHandler::success($result, 'Arama sonuçları başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Arama yapılırken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * ID'ye göre soru getirir
     * @param int $questionId - Soru ID'si
     * @return array - Soru bilgileri
     */
    public function getQuestionById($questionId)
    {
        try {
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE s.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $questionId]);

            $question = $stmt->fetch();

            if (!$question) {
                ResponseHandler::notFound('Soru bulunamadı');
            }

            return $question;

        } catch (Exception $e) {
            ResponseHandler::error('Soru getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soru günceller
     * @param int $questionId - Soru ID'si
     * @param array $questionData - Güncellenecek veriler
     * @return array - Güncellenmiş soru bilgileri
     */
    public function updateQuestion($questionId, $questionData)
    {
        try {
            // Sorunun var olup olmadığını kontrol et
            $existingQuestion = $this->getQuestionById($questionId);

            $updateFields = [];
            $params = [':id' => $questionId];

            // Güncellenecek alanları hazırla
            $fieldMappings = [
                'kategoriId' => 'kategori_id',
                'soruMetni' => 'soru_metni',
                'secenekA' => 'secenek_a',
                'secenekB' => 'secenek_b',
                'secenekC' => 'secenek_c',
                'secenekD' => 'secenek_d',
                'dogruCevap' => 'dogru_cevap',
                'aciklama' => 'aciklama',
                'zorlukSeviyesi' => 'zorluk_seviyesi',
                'resimUrl' => 'resim_url',
                'durum' => 'durum'
            ];

            foreach ($fieldMappings as $inputField => $dbField) {
                if (isset($questionData[$inputField])) {
                    $updateFields[] = "{$dbField} = :{$dbField}";
                    $params[":{$dbField}"] = $questionData[$inputField];
                }
            }

            if (empty($updateFields)) {
                ResponseHandler::error('Güncellenecek alan bulunamadı');
            }

            $sql = "UPDATE sorular SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // Log kaydı
            $this->addLog('Soru Güncellendi', "Soru güncellendi. ID: {$questionId}");

            // Güncellenmiş soruyu getir
            $updatedQuestion = $this->getQuestionById($questionId);

            ResponseHandler::success($updatedQuestion, 'Soru başarıyla güncellendi');

        } catch (Exception $e) {
            ResponseHandler::error('Soru güncellenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soru siler
     * @param int $questionId - Soru ID'si
     * @return void
     */
    public function deleteQuestion($questionId)
    {
        try {
            // Sorunun var olup olmadığını kontrol et
            $existingQuestion = $this->getQuestionById($questionId);

            $sql = "DELETE FROM sorular WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $questionId]);

            // Log kaydı
            $this->addLog('Soru Silindi', "Soru silindi. ID: {$questionId}");

            ResponseHandler::success(null, 'Soru başarıyla silindi');

        } catch (Exception $e) {
            ResponseHandler::error('Soru silinirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kategoriye göre soruları getirir
     * @param int $categoryId - Kategori ID'si
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @return array - Kategori soruları
     */
    public function getQuestionsByCategory($categoryId, $page = 1, $pageSize = 10)
    {
        try {
            $offset = ($page - 1) * $pageSize;

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM sorular WHERE kategori_id = :category_id";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':category_id' => $categoryId]);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE s.kategori_id = :category_id 
                    ORDER BY s.created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $questions = $stmt->fetchAll();

            $result = [
                'questions' => $questions,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            ResponseHandler::success($result, 'Kategori soruları başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategori soruları getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Rastgele sorular getirir (quiz için)
     * @param int $categoryId - Kategori ID'si (opsiyonel)
     * @param int $count - Soru sayısı
     * @param string $difficulty - Zorluk seviyesi (opsiyonel)
     * @return array - Rastgele sorular
     */
    public function getRandomQuestions($categoryId = null, $count = 10, $difficulty = null)
    {
        try {
            $whereConditions = ["s.durum = 'aktif'"];
            $params = [];

            if ($categoryId) {
                $whereConditions[] = "s.kategori_id = :category_id";
                $params[':category_id'] = $categoryId;
            }

            if ($difficulty) {
                $whereConditions[] = "s.zorluk_seviyesi = :difficulty";
                $params[':difficulty'] = $difficulty;
            }

            $whereClause = implode(' AND ', $whereConditions);

            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE {$whereClause} 
                    ORDER BY RAND() 
                    LIMIT :count";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':count', $count, PDO::PARAM_INT);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $questions = $stmt->fetchAll();

            ResponseHandler::success($questions, 'Rastgele sorular başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Rastgele sorular getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soru verilerini validate eder
     * @param array $questionData - Soru verileri
     * @throws Exception - Validation hatası
     */
    private function validateQuestionData($questionData)
    {
        $errors = [];

        if (empty($questionData['kategoriId'])) {
            $errors[] = 'Kategori seçimi zorunludur';
        }

        if (empty($questionData['soruMetni'])) {
            $errors[] = 'Soru metni zorunludur';
        }

        if (empty($questionData['secenekA'])) {
            $errors[] = 'A seçeneği zorunludur';
        }

        if (empty($questionData['secenekB'])) {
            $errors[] = 'B seçeneği zorunludur';
        }

        if (empty($questionData['secenekC'])) {
            $errors[] = 'C seçeneği zorunludur';
        }

        if (empty($questionData['secenekD'])) {
            $errors[] = 'D seçeneği zorunludur';
        }

        if (empty($questionData['dogruCevap'])) {
            $errors[] = 'Doğru cevap seçimi zorunludur';
        }

        // Doğru cevap geçerli bir seçenek mi kontrol et
        $validAnswers = ['A', 'B', 'C', 'D'];
        if (!in_array($questionData['dogruCevap'], $validAnswers)) {
            $errors[] = 'Doğru cevap A, B, C veya D olmalıdır';
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