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
$logService = new LogService($database);
$responseHandler = new ResponseHandler();

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $page = (int) ($_GET['page'] ?? 1);
            $limit = (int) ($_GET['limit'] ?? 10);
            $search = $_GET['search'] ?? '';
            $logType = $_GET['type'] ?? null;
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            $userId = $_GET['user_id'] ?? null;
            $stats = isset($_GET['stats']);
            $period = $_GET['period'] ?? 'daily';

            if ($id) {
                // Tek log getirme
                $log = $logService->getLogById($id);
                if ($log) {
                    echo $responseHandler->success(['log' => $log]);
                } else {
                    echo $responseHandler->notFound('Log bulunamadı');
                }
            } elseif ($stats) {
                // İstatistikler
                $statistics = $logService->getLogStatistics($period);
                echo $responseHandler->success(['statistics' => $statistics]);
            } elseif ($startDate && $endDate) {
                // Tarih aralığına göre loglar
                $result = $logService->getLogsByDateRange($startDate, $endDate, $page, $limit);
                echo $responseHandler->success($result);
            } elseif ($userId) {
                // Kullanıcıya göre loglar
                $result = $logService->getLogsByUser($userId, $page, $limit);
                echo $responseHandler->success($result);
            } else {
                // Sayfalı loglar
                $result = $logService->getLogsPaginated($page, $limit, $search, $logType);
                echo $responseHandler->success($result);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                echo $responseHandler->error('Geçersiz JSON verisi');
                break;
            }

            $result = $logService->addLog($input);
            echo $responseHandler->success($result, 'Log başarıyla eklendi');
            break;

        case 'DELETE':
            $clean = isset($_GET['clean']);
            $daysOld = (int) ($_GET['days'] ?? 30);

            if ($clean) {
                // Eski logları temizleme
                $result = $logService->cleanOldLogs($daysOld);
                echo $responseHandler->success($result, 'Eski loglar temizlendi');
            } else {
                echo $responseHandler->error('Geçersiz DELETE isteği');
            }
            break;

        default:
            echo $responseHandler->error('Desteklenmeyen HTTP metodu');
            break;
    }

} catch (Exception $e) {
    error_log('Log API Hatası: ' . $e->getMessage());
    echo $responseHandler->error('Hata: ' . $e->getMessage());
}
?>