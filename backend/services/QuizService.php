<?php
/**
 * Quiz Servisi - MySQL Versiyonu
 * Firebase quizService.js'in PHP PDO ile yeniden yazılmış hali
 */

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class QuizService
{
    private $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    /**
     * Quizleri sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $limit - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Quizler listesi ve sayfalama bilgileri
     */
    public function getQuizzes($page = 1, $limit = 10, $search = '')
    {
        try {
            $offset = ($page - 1) * $limit;

            $whereClause = '';
            $params = [];

            if (!empty($search)) {
                $whereClause = "WHERE quiz_name LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM quizler {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalRecords = $countStmt->fetch()['total'];

            // Quizleri getir
            $sql = "SELECT * FROM quizler {$whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $quizzes = $stmt->fetchAll();

            $totalPages = ceil($totalRecords / $limit);

            return [
                'quizzes' => $quizzes,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_records' => $totalRecords,
                    'limit' => $limit
                ]
            ];

        } catch (Exception $e) {
            throw new Exception('Quizler getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Yeni quiz ekler
     * @param array $quizData - Quiz bilgileri
     * @return array - Eklenen quiz bilgileri
     */
    public function addQuiz($quizData)
    {
        try {
            // Validation
            $this->validateQuizData($quizData);

            // Quiz adı kontrolü
            if ($this->isQuizNameTaken($quizData['quizName'])) {
                ResponseHandler::error('Bu quiz adı zaten kullanılıyor. Lütfen farklı bir ad seçin.', 400);
            }

            $this->db->beginTransaction();

            // Ana quiz kaydını ekle
            $sql = "INSERT INTO quizler (
                quiz_name, category_order, questions_by_category, questions_random, 
                categories_random, category_count, question_count, created_at
            ) VALUES (
                :quiz_name, :category_order, :questions_by_category, :questions_random,
                :categories_random, :category_count, :question_count, NOW()
            )";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':quiz_name' => $quizData['quizName'],
                ':category_order' => json_encode($quizData['categoryOrder']),
                ':questions_by_category' => json_encode($quizData['questionsByCategory']),
                ':questions_random' => $quizData['questionOrderType'] === 'random' ? 1 : 0,
                ':categories_random' => $quizData['categoryOrderType'] === 'random' ? 1 : 0,
                ':category_count' => $quizData['categoryCount'],
                ':question_count' => $quizData['questionCount']
            ]);

            $quizId = $this->db->lastInsertId();

            // Quiz-kategori ilişkilerini ekle
            $this->addQuizCategoryRelations($quizId, $quizData['categoryOrder']);

            // Quiz-soru ilişkilerini ekle
            $this->addQuizQuestionRelations($quizId, $quizData['questionsByCategory']);

            $this->db->commit();

            // Log kaydı
            $this->addLog('Yeni Quiz Eklendi', "{$quizData['quizName']} adlı quiz eklendi.");

            // Eklenen quizi getir
            $addedQuiz = $this->getQuizById($quizId);

            ResponseHandler::success($addedQuiz, 'Quiz başarıyla eklendi', 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            ResponseHandler::error('Quiz eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * ID'ye göre quiz getirir
     * @param int $quizId - Quiz ID'si
     * @return array - Quiz bilgileri
     */
    public function getQuizById($quizId)
    {
        try {
            $sql = "SELECT * FROM quizler WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $quizId]);

            $quiz = $stmt->fetch();

            if (!$quiz) {
                ResponseHandler::notFound('Quiz bulunamadı');
            }

            // JSON alanları decode et
            $quiz['category_order'] = json_decode($quiz['category_order'], true);
            $quiz['questions_by_category'] = json_decode($quiz['questions_by_category'], true);

            return $quiz;

        } catch (Exception $e) {
            ResponseHandler::error('Quiz getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Quiz günceller
     * @param int $quizId - Quiz ID'si
     * @param array $quizData - Güncellenecek veriler
     * @return array - Güncellenmiş quiz bilgileri
     */
    public function updateQuiz($quizId, $quizData)
    {
        try {
            // Quizin var olup olmadığını kontrol et
            $existingQuiz = $this->getQuizById($quizId);

            // Quiz adı değişiyorsa benzersizlik kontrolü
            if (
                isset($quizData['quizName']) &&
                $quizData['quizName'] !== $existingQuiz['quiz_name'] &&
                $this->isQuizNameTaken($quizData['quizName'])
            ) {
                ResponseHandler::error('Bu quiz adı zaten kullanılıyor', 400);
            }

            $this->db->beginTransaction();

            $updateFields = [];
            $params = [':id' => $quizId];

            // Güncellenecek alanları hazırla
            $fieldMappings = [
                'quizName' => 'quiz_name',
                'categoryOrder' => 'category_order',
                'questionsByCategory' => 'questions_by_category',
                'questionOrderType' => 'questions_random',
                'categoryOrderType' => 'categories_random',
                'categoryCount' => 'category_count',
                'questionCount' => 'question_count'
            ];

            foreach ($fieldMappings as $inputField => $dbField) {
                if (isset($quizData[$inputField])) {
                    $updateFields[] = "{$dbField} = :{$dbField}";

                    // JSON alanları için özel işlem
                    if (in_array($dbField, ['category_order', 'questions_by_category'])) {
                        $params[":{$dbField}"] = json_encode($quizData[$inputField]);
                    } elseif (in_array($dbField, ['questions_random', 'categories_random'])) {
                        $params[":{$dbField}"] = $quizData[$inputField] === 'random' ? 1 : 0;
                    } else {
                        $params[":{$dbField}"] = $quizData[$inputField];
                    }
                }
            }

            if (empty($updateFields)) {
                ResponseHandler::error('Güncellenecek alan bulunamadı');
            }

            $sql = "UPDATE quizler SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // İlişkileri güncelle
            if (isset($quizData['categoryOrder'])) {
                $this->updateQuizCategoryRelations($quizId, $quizData['categoryOrder']);
            }

            if (isset($quizData['questionsByCategory'])) {
                $this->updateQuizQuestionRelations($quizId, $quizData['questionsByCategory']);
            }

            $this->db->commit();

            // Log kaydı
            $this->addLog('Quiz Güncellendi', "Quiz güncellendi. ID: {$quizId}");

            // Güncellenmiş quizi getir
            $updatedQuiz = $this->getQuizById($quizId);

            ResponseHandler::success($updatedQuiz, 'Quiz başarıyla güncellendi');

        } catch (Exception $e) {
            $this->db->rollBack();
            ResponseHandler::error('Quiz güncellenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Quiz siler
     * @param int $quizId - Quiz ID'si
     * @return void
     */
    public function deleteQuiz($quizId)
    {
        try {
            // Quizin var olup olmadığını kontrol et
            $existingQuiz = $this->getQuizById($quizId);

            $this->db->beginTransaction();

            // Quiz-soru ilişkilerini sil
            $sql = "DELETE FROM quiz_sorular WHERE quiz_id = :quiz_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':quiz_id' => $quizId]);

            // Quiz-kategori ilişkilerini sil
            $sql = "DELETE FROM quiz_kategoriler WHERE quiz_id = :quiz_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':quiz_id' => $quizId]);

            // Ana quiz kaydını sil
            $sql = "DELETE FROM quizler WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $quizId]);

            $this->db->commit();

            // Log kaydı
            $this->addLog('Quiz Silindi', "Quiz silindi. ID: {$quizId}");

            ResponseHandler::success(null, 'Quiz başarıyla silindi');

        } catch (Exception $e) {
            $this->db->rollBack();
            ResponseHandler::error('Quiz silinirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Quiz adı daha önce alınmış mı kontrol eder
     * @param string $quizName - Kontrol edilecek quiz adı
     * @param int|null $excludeId - Hariç tutulacak quiz ID'si
     * @return bool - true: alınmış, false: alınmamış
     */
    public function isQuizNameTaken($quizName, $excludeId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM quizler WHERE quiz_name = :quiz_name";
            $params = [':quiz_name' => $quizName];

            if ($excludeId) {
                $sql .= " AND id != :exclude_id";
                $params[':exclude_id'] = $excludeId;
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $result = $stmt->fetch();
            return $result['count'] > 0;

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Quiz'in kategorilerini getirir
     * @param int $quizId - Quiz ID'si
     * @return array - Kategoriler listesi
     */
    public function getQuizCategories($quizId)
    {
        try {
            $sql = "SELECT k.* FROM kategoriler k 
                    INNER JOIN quiz_kategoriler qk ON k.id = qk.kategori_id 
                    WHERE qk.quiz_id = :quiz_id 
                    ORDER BY qk.sira";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([':quiz_id' => $quizId]);

            return $stmt->fetchAll();
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Quiz'in sorularını getirir
     * @param int $quizId - Quiz ID'si
     * @return array - Sorular listesi
     */
    public function getQuizQuestions($quizId)
    {
        try {
            $sql = "SELECT s.*, qs.sira FROM sorular s 
                    INNER JOIN quiz_sorular qs ON s.id = qs.soru_id 
                    WHERE qs.quiz_id = :quiz_id 
                    ORDER BY qs.kategori_id, qs.sira";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([':quiz_id' => $quizId]);

            return $stmt->fetchAll();
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Quiz-kategori ilişkilerini ekler
     * @param int $quizId - Quiz ID'si
     * @param array $categoryOrder - Kategori sırası
     */
    public function addQuizCategoryRelations($quizId, $categoryOrder)
    {
        $sql = "INSERT INTO quiz_kategoriler (quiz_id, kategori_id, sira) VALUES (:quiz_id, :kategori_id, :sira)";
        $stmt = $this->db->prepare($sql);

        foreach ($categoryOrder as $index => $categoryId) {
            $stmt->execute([
                ':quiz_id' => $quizId,
                ':kategori_id' => $categoryId,
                ':sira' => $index + 1
            ]);
        }
    }

    /**
     * Quiz-soru ilişkilerini ekler
     * @param int $quizId - Quiz ID'si
     * @param array $questionsByCategory - Kategoriye göre sorular
     */
    public function addQuizQuestionRelations($quizId, $questionsByCategory)
    {
        $sql = "INSERT INTO quiz_sorular (quiz_id, kategori_id, soru_id, sira) VALUES (:quiz_id, :kategori_id, :soru_id, :sira)";
        $stmt = $this->db->prepare($sql);

        foreach ($questionsByCategory as $categoryId => $questionIds) {
            foreach ($questionIds as $index => $questionId) {
                $stmt->execute([
                    ':quiz_id' => $quizId,
                    ':kategori_id' => $categoryId,
                    ':soru_id' => $questionId,
                    ':sira' => $index + 1
                ]);
            }
        }
    }

    /**
     * Quiz-kategori ilişkilerini günceller
     * @param int $quizId - Quiz ID'si
     * @param array $categoryOrder - Yeni kategori sırası
     */
    public function updateQuizCategoryRelations($quizId, $categoryOrder)
    {
        // Eski ilişkileri sil
        $sql = "DELETE FROM quiz_kategoriler WHERE quiz_id = :quiz_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':quiz_id' => $quizId]);

        // Yeni ilişkileri ekle
        $this->addQuizCategoryRelations($quizId, $categoryOrder);
    }

    /**
     * Quiz-soru ilişkilerini günceller
     * @param int $quizId - Quiz ID'si
     * @param array $questionsByCategory - Yeni kategori-soru ilişkileri
     */
    public function updateQuizQuestionRelations($quizId, $questionsByCategory)
    {
        // Eski ilişkileri sil
        $sql = "DELETE FROM quiz_sorular WHERE quiz_id = :quiz_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':quiz_id' => $quizId]);

        // Yeni ilişkileri ekle
        $this->addQuizQuestionRelations($quizId, $questionsByCategory);
    }

    /**
     * Quiz verilerini validate eder
     * @param array $quizData - Quiz verileri
     * @throws Exception - Validation hatası
     */
    private function validateQuizData($quizData)
    {
        $errors = [];

        if (empty($quizData['quizName'])) {
            $errors[] = 'Quiz adı zorunludur';
        }

        if (empty($quizData['categoryOrder']) || !is_array($quizData['categoryOrder'])) {
            $errors[] = 'Kategori sırası zorunludur';
        }

        if (empty($quizData['questionsByCategory']) || !is_array($quizData['questionsByCategory'])) {
            $errors[] = 'Kategori-soru ilişkileri zorunludur';
        }

        if (!in_array($quizData['questionOrderType'], ['random', 'ordered'])) {
            $errors[] = 'Geçersiz soru sıralama tipi';
        }

        if (!in_array($quizData['categoryOrderType'], ['random', 'ordered'])) {
            $errors[] = 'Geçersiz kategori sıralama tipi';
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