<?php
/**
 * Kategori API Endpoint'leri
 * RESTful API için kategori işlemleri
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

$categoryService = new CategoryService();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// API endpoint'ini al (son kısım)
$endpoint = end($pathParts);

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Tek kategori getir
                $category = $categoryService->getCategoryById($_GET['id']);
                ResponseHandler::success($category, 'Kategori başarıyla getirildi');
            } elseif (isset($_GET['category_name'])) {
                // Kategori adına göre soru sayısını getir
                $questionCount = $categoryService->getQuestionCountByCategoryName($_GET['category_name']);
                ResponseHandler::success(['question_count' => $questionCount], 'Kategori soru sayısı getirildi');
            } elseif (isset($_GET['page'])) {
                // Sayfalı kategoriler getir
                $page = (int) $_GET['page'];
                $pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 6;
                $search = isset($_GET['search']) ? $_GET['search'] : "";
                $allCategories = isset($_GET['all']) && $_GET['all'] === 'true';

                if ($allCategories) {
                    $categoryService->getAllCategoriesPaginated($page, $pageSize, $search);
                } else {
                    $categoryService->getCategoriesPaginated($page, $pageSize, $search);
                }
            } elseif (isset($_GET['active']) && $_GET['active'] === 'true') {
                // Aktif kategoriler getir (sayfalama olmadan)
                $categoryService->getAllActiveCategories();
            } else {
                // Tüm kategoriler getir
                $categoryService->getAllCategoriesPaginated(1, 100);
            }
            break;

        case 'POST':
            // Yeni kategori ekle
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi', 400);
            }
            $categoryService->addCategory($input);
            break;

        case 'PUT':
            // Kategori güncelle
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Kategori ID\'si gerekli', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi', 400);
            }
            $categoryService->updateCategory($_GET['id'], $input);
            break;

        case 'DELETE':
            // Kategori sil
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Kategori ID\'si gerekli', 400);
            }
            $categoryService->deleteCategory($_GET['id']);
            break;

        default:
            ResponseHandler::error('Desteklenmeyen HTTP metodu', 405);
    }

} catch (Exception $e) {
    ResponseHandler::error('Hata: ' . $e->getMessage(), 500);
}
?>