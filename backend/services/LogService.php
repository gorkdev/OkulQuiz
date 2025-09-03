<?php
/**
 * Log Servisi - MySQL Versiyonu
 * Firebase logService.js'in PHP PDO ile yeniden yazılmış hali
 */

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class LogService
{
    private $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    /**
     * Yeni log kaydı ekler
     * @param array $logData - Log bilgileri
     * @return array - Eklenen log bilgileri
     */
    public function addLog($logData)
    {
        try {
            // Validation
            $this->validateLogData($logData);

            $sql = "INSERT INTO logs (title, details, created_at) VALUES (:title, :details, NOW())";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':title' => $logData['title'],
                ':details' => $logData['details'] ?? null
            ]);

            $logId = $this->db->lastInsertId();

            // Eklenen logu getir
            $addedLog = $this->getLogById($logId);

            return $addedLog;

        } catch (Exception $e) {
            throw new Exception('Log eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Logları sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $limit - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @param string $logType - Log tipi
     * @return array - Sayfalı loglar listesi
     */
    public function getLogsPaginated($page = 1, $limit = 10, $search = '', $logType = null)
    {
        try {
            $offset = ($page - 1) * $limit;

            $whereClause = '';
            $params = [];

            if (!empty($search)) {
                $whereClause = "WHERE title LIKE :search OR details LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            if ($logType) {
                if (empty($whereClause)) {
                    $whereClause = "WHERE title LIKE :type";
                } else {
                    $whereClause .= " AND title LIKE :type";
                }
                $params[':type'] = "%{$logType}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM logs {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT * FROM logs {$whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $logs = $stmt->fetchAll();

            $result = [
                'logs' => $logs,
                'pagination' => [
                    'current_page' => $page,
                    'limit' => $limit,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit),
                    'has_more' => ($page * $limit) < $totalCount
                ]
            ];

            return $result;

        } catch (Exception $e) {
            throw new Exception('Loglar getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * ID'ye göre log getirir
     * @param int $logId - Log ID'si
     * @return array - Log bilgileri
     */
    public function getLogById($logId)
    {
        try {
            $sql = "SELECT * FROM logs WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $logId]);

            $log = $stmt->fetch();

            if (!$log) {
                return null;
            }

            return $log;

        } catch (Exception $e) {
            throw new Exception('Log getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Logları tarih aralığına göre getirir
     * @param string $startDate - Başlangıç tarihi (Y-m-d)
     * @param string $endDate - Bitiş tarihi (Y-m-d)
     * @param int $page - Sayfa numarası
     * @param int $limit - Sayfa başına kayıt sayısı
     * @return array - Tarih aralığı logları
     */
    public function getLogsByDateRange($startDate, $endDate, $page = 1, $limit = 10)
    {
        try {
            $offset = ($page - 1) * $limit;

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM logs 
                        WHERE DATE(created_at) BETWEEN :start_date AND :end_date";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT * FROM logs 
                    WHERE DATE(created_at) BETWEEN :start_date AND :end_date 
                    ORDER BY created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':start_date', $startDate);
            $stmt->bindValue(':end_date', $endDate);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $logs = $stmt->fetchAll();

            $result = [
                'logs' => $logs,
                'pagination' => [
                    'current_page' => $page,
                    'limit' => $limit,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit),
                    'has_more' => ($page * $limit) < $totalCount
                ],
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ];

            return $result;

        } catch (Exception $e) {
            throw new Exception('Loglar getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Logları başlığa göre arama yapar
     * @param string $search - Arama terimi
     * @param int $page - Sayfa numarası
     * @param int $limit - Sayfa başına kayıt sayısı
     * @return array - Arama sonuçları
     */
    public function searchLogs($search = '', $page = 1, $limit = 10)
    {
        try {
            $offset = ($page - 1) * $limit;

            if (empty($search)) {
                // Arama yoksa normal paginated çek
                return $this->getLogsPaginated($page, $limit);
            }

            $searchTerm = "%{$search}%";

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM logs 
                        WHERE title LIKE :search OR details LIKE :search";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':search' => $searchTerm]);
            $totalCount = $countStmt->fetch()['total'];

            // Arama sonuçlarını al
            $sql = "SELECT * FROM logs 
                    WHERE title LIKE :search OR details LIKE :search 
                    ORDER BY created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':search', $searchTerm);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $logs = $stmt->fetchAll();

            $result = [
                'logs' => $logs,
                'pagination' => [
                    'current_page' => $page,
                    'limit' => $limit,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit),
                    'has_more' => ($page * $limit) < $totalCount
                ],
                'search_term' => $search
            ];

            return $result;

        } catch (Exception $e) {
            throw new Exception('Log araması yapılırken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Eski logları temizler (belirli gün sayısından önceki)
     * @param int $daysOld - Kaç günden eski loglar temizlenecek
     * @return array - Temizlenen log sayısı
     */
    public function cleanOldLogs($daysOld = 30)
    {
        try {
            $beforeDate = date('Y-m-d', strtotime("-{$daysOld} days"));

            // Silinecek log sayısını al
            $countSql = "SELECT COUNT(*) as total FROM logs WHERE DATE(created_at) < :before_date";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':before_date' => $beforeDate]);
            $totalCount = $countStmt->fetch()['total'];

            // Eski logları sil
            $sql = "DELETE FROM logs WHERE DATE(created_at) < :before_date";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':before_date' => $beforeDate]);

            $result = [
                'deleted_count' => $totalCount,
                'before_date' => $beforeDate,
                'days_old' => $daysOld
            ];

            return $result;

        } catch (Exception $e) {
            throw new Exception('Eski loglar temizlenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Log istatistiklerini getirir
     * @param string $period - İstatistik periyodu (daily, weekly, monthly)
     * @return array - Log istatistikleri
     */
    public function getLogStatistics($period = 'daily')
    {
        try {
            // Toplam log sayısı
            $totalSql = "SELECT COUNT(*) as total FROM logs";
            $totalStmt = $this->db->prepare($totalSql);
            $totalStmt->execute();
            $totalLogs = $totalStmt->fetch()['total'];

            // Bugünkü log sayısı
            $todaySql = "SELECT COUNT(*) as total FROM logs WHERE DATE(created_at) = CURDATE()";
            $todayStmt = $this->db->prepare($todaySql);
            $todayStmt->execute();
            $todayLogs = $todayStmt->fetch()['total'];

            // Bu haftaki log sayısı
            $weekSql = "SELECT COUNT(*) as total FROM logs WHERE YEARWEEK(created_at) = YEARWEEK(NOW())";
            $weekStmt = $this->db->prepare($weekSql);
            $weekStmt->execute();
            $weekLogs = $weekStmt->fetch()['total'];

            // Bu ayki log sayısı
            $monthSql = "SELECT COUNT(*) as total FROM logs WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())";
            $monthStmt = $this->db->prepare($monthSql);
            $monthStmt->execute();
            $monthLogs = $monthStmt->fetch()['total'];

            // En çok kullanılan log başlıkları
            $topTitlesSql = "SELECT title, COUNT(*) as count FROM logs GROUP BY title ORDER BY count DESC LIMIT 10";
            $topTitlesStmt = $this->db->prepare($topTitlesSql);
            $topTitlesStmt->execute();
            $topTitles = $topTitlesStmt->fetchAll();

            $statistics = [
                'total_logs' => $totalLogs,
                'today_logs' => $todayLogs,
                'week_logs' => $weekLogs,
                'month_logs' => $monthLogs,
                'top_titles' => $topTitles
            ];

            return $statistics;

        } catch (Exception $e) {
            throw new Exception('Log istatistikleri getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kullanıcıya göre logları getirir
     * @param int $userId - Kullanıcı ID'si
     * @param int $page - Sayfa numarası
     * @param int $limit - Sayfa başına kayıt sayısı
     * @return array - Kullanıcı logları
     */
    public function getLogsByUser($userId, $page = 1, $limit = 10)
    {
        try {
            $offset = ($page - 1) * $limit;

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM logs WHERE user_id = :user_id";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':user_id' => $userId]);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT * FROM logs WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':user_id', $userId);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $logs = $stmt->fetchAll();

            $result = [
                'logs' => $logs,
                'pagination' => [
                    'current_page' => $page,
                    'limit' => $limit,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit),
                    'has_more' => ($page * $limit) < $totalCount
                ],
                'user_id' => $userId
            ];

            return $result;

        } catch (Exception $e) {
            throw new Exception('Kullanıcı logları getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Log verilerini validate eder
     * @param array $logData - Log verileri
     * @throws Exception - Validation hatası
     */
    private function validateLogData($logData)
    {
        $errors = [];

        if (empty($logData['title'])) {
            $errors[] = 'Log başlığı zorunludur';
        }

        if (strlen($logData['title']) > 255) {
            $errors[] = 'Log başlığı en fazla 255 karakter olabilir';
        }

        if (!empty($errors)) {
            ResponseHandler::validationError($errors);
        }
    }
}
?>