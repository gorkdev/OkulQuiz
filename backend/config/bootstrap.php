<?php
/**
 * Bootstrap dosyası - Tüm servisleri ve utility'leri dahil eder
 */

// CORS ayarları
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database bağlantısı
require_once __DIR__ . '/database.php';

// Utility sınıfları
require_once __DIR__ . '/../utils/ResponseHandler.php';

// Servis sınıfları
require_once __DIR__ . '/../services/SchoolService.php';
require_once __DIR__ . '/../services/CategoryService.php';
require_once __DIR__ . '/../services/QuestionService.php';
require_once __DIR__ . '/../services/QuizService.php';
require_once __DIR__ . '/../services/LogService.php';
require_once __DIR__ . '/../services/CreditService.php';

// Database instance'ı oluştur
$database = Database::getInstance();
?>