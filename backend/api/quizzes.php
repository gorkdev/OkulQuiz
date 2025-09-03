<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/bootstrap.php';

$database = Database::getInstance();
$quizService = new QuizService($database);
$responseHandler = new ResponseHandler();

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $page = (int) ($_GET['page'] ?? 1);
            $limit = (int) ($_GET['limit'] ?? 10);
            $search = $_GET['search'] ?? '';
            $name = $_GET['name'] ?? null;
            $excludeId = $_GET['exclude_id'] ?? null;
            $categories = isset($_GET['categories']);
            $questions = isset($_GET['questions']);

            if ($id) {
                // Tek quiz getirme
                $quiz = $quizService->getQuizById($id);
                if ($quiz) {
                    $result = ['quiz' => $quiz];

                    if ($categories) {
                        $result['categories'] = $quizService->getQuizCategories($id);
                    }

                    if ($questions) {
                        $result['questions'] = $quizService->getQuizQuestions($id);
                    }

                    echo $responseHandler->success($result);
                } else {
                    echo $responseHandler->notFound('Quiz bulunamadı');
                }
            } elseif ($name) {
                // Quiz adı kontrolü
                $exists = $quizService->isQuizNameTaken($name, $excludeId);
                echo $responseHandler->success(['exists' => $exists]);
            } else {
                // Quiz listesi
                $result = $quizService->getQuizzes($page, $limit, $search);
                echo $responseHandler->success($result);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                echo $responseHandler->error('Geçersiz JSON verisi');
                break;
            }

            $relations = $_GET['relations'] ?? null;

            if ($relations === 'categories') {
                // Quiz kategori ilişkileri ekleme
                $result = $quizService->addQuizCategoryRelations($input['quiz_id'], $input['category_ids']);
                echo $responseHandler->success($result, 'Quiz kategori ilişkileri eklendi');
            } elseif ($relations === 'questions') {
                // Quiz soru ilişkileri ekleme
                $result = $quizService->addQuizQuestionRelations($input['quiz_id'], $input['question_ids']);
                echo $responseHandler->success($result, 'Quiz soru ilişkileri eklendi');
            } else {
                // Yeni quiz ekleme
                $result = $quizService->addQuiz($input);
                echo $responseHandler->success($result, 'Quiz başarıyla eklendi');
            }
            break;

        case 'PUT':
            $id = $_GET['id'] ?? null;
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$id) {
                echo $responseHandler->error('Quiz ID gerekli');
                break;
            }

            if (!$input) {
                echo $responseHandler->error('Geçersiz JSON verisi');
                break;
            }

            $relations = $_GET['relations'] ?? null;

            if ($relations === 'categories') {
                // Quiz kategori ilişkileri güncelleme
                $result = $quizService->updateQuizCategoryRelations($id, $input['category_ids']);
                echo $responseHandler->success($result, 'Quiz kategori ilişkileri güncellendi');
            } elseif ($relations === 'questions') {
                // Quiz soru ilişkileri güncelleme
                $result = $quizService->updateQuizQuestionRelations($id, $input['question_ids']);
                echo $responseHandler->success($result, 'Quiz soru ilişkileri güncellendi');
            } else {
                // Quiz güncelleme
                $result = $quizService->updateQuiz($id, $input);
                echo $responseHandler->success($result, 'Quiz başarıyla güncellendi');
            }
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id) {
                echo $responseHandler->error('Quiz ID gerekli');
                break;
            }

            $result = $quizService->deleteQuiz($id);
            echo $responseHandler->success($result, 'Quiz başarıyla silindi');
            break;

        default:
            echo $responseHandler->error('Desteklenmeyen HTTP metodu');
            break;
    }

} catch (Exception $e) {
    error_log('Quiz API Hatası: ' . $e->getMessage());
    echo $responseHandler->error('Hata: ' . $e->getMessage());
}
?>