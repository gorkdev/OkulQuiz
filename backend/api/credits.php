<?php
// Hata ayıklama ayarları
error_reporting(E_ALL); // Tüm hataları raporla
ini_set('display_errors', 0); // Hataları ekrana bastırma
ini_set('log_errors', 1); // Hataları log dosyasına yaz

require_once __DIR__ . '/../config/bootstrap.php';

$database = Database::getInstance();
$creditService = new CreditService($database);
$responseHandler = new ResponseHandler();

// Debug log ekle
error_log("CREDITS API - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("CREDITS API - Database instance: " . ($database ? "OK" : "NULL"));
error_log("CREDITS API - CreditService instance: " . ($creditService ? "OK" : "NULL"));

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Tek kredi getir
                $credit = $creditService->getCreditById($_GET['id']);
                ResponseHandler::success(['credit' => $credit], 'Kredi başarıyla getirildi');
            } elseif (isset($_GET['active'])) {
                // Aktif krediler getir
                $credits = $creditService->getAllActiveCredits();
                ResponseHandler::success(['credits' => $credits], 'Aktif krediler başarıyla getirildi');
            } elseif (isset($_GET['page'])) {
                // Sayfalı krediler getir
                $page = (int) $_GET['page'];
                $pageSize = isset($_GET['pageSize']) ? (int) $_GET['pageSize'] : 6;
                $search = isset($_GET['search']) ? $_GET['search'] : "";
                $creditService->getCreditsPaginated($page, $pageSize, $search);
            } else {
                // Tüm krediler getir
                $creditService->getCreditsPaginated(1, 10);
            }
            break;

        case 'POST':
            // Okula kredi ekle (yeni endpoint) - action parametresi ile kontrol
            if (isset($_GET['action']) && $_GET['action'] === 'addToSchool') {
                error_log("CREDITS API - POST method called for addToSchool");

                $input = json_decode(file_get_contents('php://input'), true);
                error_log("CREDITS API - Input data: " . json_encode($input));

                if (!$input || !isset($input['schoolId']) || !isset($input['creditAmount'])) {
                    error_log("CREDITS API - Missing required fields");
                    ResponseHandler::error('Okul ID ve kredi miktarı gerekli');
                    break;
                }

                error_log("CREDITS API - Calling addCreditToSchool with schoolId: {$input['schoolId']}, creditAmount: {$input['creditAmount']}");

                try {
                    $result = $creditService->addCreditToSchool($input['schoolId'], $input['creditAmount']);
                    error_log("CREDITS API - Success result: " . json_encode($result));
                    ResponseHandler::success($result, $result['message']);
                } catch (Exception $e) {
                    error_log("CREDITS API - Error in addCreditToSchool: " . $e->getMessage());
                    ResponseHandler::error('Kredi eklenirken hata oluştu: ' . $e->getMessage());
                }
                break;
            }

            // Normal kredi ekleme (eski kod)
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi');
                break;
            }

            $result = $creditService->addCredit($input);
            ResponseHandler::success($result, 'Kredi başarıyla eklendi');
            break;

        case 'PUT':
            // Kredi güncelle
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Kredi ID gerekli');
                break;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                ResponseHandler::error('Geçersiz JSON verisi');
                break;
            }

            $result = $creditService->updateCredit($_GET['id'], $input);
            ResponseHandler::success($result, 'Kredi başarıyla güncellendi');
            break;

        case 'DELETE':
            // Kredi sil
            if (!isset($_GET['id'])) {
                ResponseHandler::error('Kredi ID gerekli');
                break;
            }

            $result = $creditService->deleteCredit($_GET['id']);
            ResponseHandler::success($result, 'Kredi başarıyla silindi');
            break;

        default:
            ResponseHandler::error('Desteklenmeyen HTTP metodu');
            break;
    }
} catch (Exception $e) {
    ResponseHandler::error('Hata: ' . $e->getMessage());
}
?>