<?php
/**
 * Okul API Endpoint'leri
 * RESTful API için okul işlemleri
 */

// Hata ayıklama ayarları
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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

$schoolService = new SchoolService();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// API endpoint'ini al (son kısım)
$endpoint = end($pathParts);

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Tek okul getir
                $school = $schoolService->getSchoolById($_GET['id']);
                ResponseHandler::success($school, 'Okul başarıyla getirildi');
            } elseif (isset($_GET['username'])) {
                // Kullanıcı adı kontrolü
                $isTaken = $schoolService->isUsernameTaken($_GET['username']);
                ResponseHandler::success(['isTaken' => $isTaken], 'Kullanıcı adı kontrolü yapıldı');
            } elseif (isset($_GET['page'])) {
                // Sayfalı okullar getir
                $page = (int) $_GET['page'];
                $pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 6;
                $search = isset($_GET['search']) ? $_GET['search'] : "";
                $result = $schoolService->getSchoolsPaginated($page, $pageSize, $search);
                ResponseHandler::success($result, 'Okullar başarıyla getirildi');
            } else {
                // Tüm okullar getir
                $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
                $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
                $schools = $schoolService->getSchools($limit, $offset);
                ResponseHandler::success($schools, 'Okullar başarıyla getirildi');
            }
            break;

        case 'POST':
            // Yeni okul ekle
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi', 400);
            }
            $result = $schoolService->addSchool($input);
            ResponseHandler::success($result, 'Okul başarıyla eklendi', 201);
            break;

        case 'PUT':
            // Okul güncelle
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Okul ID\'si gerekli', 400);
            }
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi', 400);
            }
            $result = $schoolService->updateSchool($_GET['id'], $input);
            ResponseHandler::success($result, 'Okul başarıyla güncellendi');
            break;

        case 'DELETE':
            // Okul sil
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Okul ID\'si gerekli', 400);
            }
            $result = $schoolService->deleteSchool($_GET['id']);
            ResponseHandler::success($result, 'Okul başarıyla silindi');
            break;

        default:
            ResponseHandler::error('Desteklenmeyen HTTP metodu', 405);
    }

} catch (Exception $e) {
    ResponseHandler::error('Hata: ' . $e->getMessage(), 500);
}
?>