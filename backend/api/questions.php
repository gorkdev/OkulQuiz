<?php
/**
 * Soru API Endpoint'leri
 * RESTful API için soru işlemleri
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS request için
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/bootstrap.php';

$questionService = new QuestionService();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// API endpoint'ini al (son kısım)
$endpoint = end($pathParts);

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Tek soru getir
                $question = $questionService->getQuestionById($_GET['id']);
                ResponseHandler::success($question, 'Soru başarıyla getirildi');
            } elseif (isset($_GET['search'])) {
                // Sorularda arama yap
                $search = $_GET['search'];
                $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
                $pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 10;
                $questionService->searchQuestions($search, $page, $pageSize);
            } elseif (isset($_GET['category'])) {
                // Kategoriye göre sorular getir
                $categoryId = (int) $_GET['category'];
                $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
                $pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 10;
                $questionService->getQuestionsByCategory($categoryId, $page, $pageSize);
            } elseif (isset($_GET['random'])) {
                // Rastgele sorular getir
                $count = isset($_GET['count']) ? (int) $_GET['count'] : 10;
                $categoryId = isset($_GET['categoryId']) ? (int) $_GET['categoryId'] : null;
                $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : null;
                $questionService->getRandomQuestions($categoryId, $count, $difficulty);
            } elseif (isset($_GET['page'])) {
                // Sayfalı sorular getir
                $page = (int) $_GET['page'];
                $pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 10;
                $search = isset($_GET['search']) ? $_GET['search'] : "";
                $questionService->getQuestionsPaginated($page, $pageSize, $search);
            } else {
                // Tüm sorular getir
                $questionService->getQuestionsPaginated(1, 10);
            }
            break;

        case 'POST':
            // Yeni soru ekle
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi', 400);
            }
            $questionService->addQuestion($input);
            break;

        case 'PUT':
            // Soru güncelle
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Soru ID\'si gerekli', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi', 400);
            }
            $questionService->updateQuestion($_GET['id'], $input);
            break;

        case 'DELETE':
            // Soru sil
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Soru ID\'si gerekli', 400);
            }
            $questionService->deleteQuestion($_GET['id']);
            break;

        default:
            ResponseHandler::error('Desteklenmeyen HTTP metodu', 405);
    }

} catch (Exception $e) {
    ResponseHandler::error('Hata: ' . $e->getMessage(), 500);
}
?>