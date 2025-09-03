<?php
/**
 * MySQL Veritabanı Bağlantı Konfigürasyonu
 * PDO kullanarak güvenli bağlantı
 */

class Database
{
    private static $instance = null;
    private $connection;

    // Veritabanı konfigürasyonu
    private $host = 'localhost';
    private $dbname = 'minikup_db';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';

    private function __construct()
    {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            throw new Exception("Veritabanı bağlantı hatası: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    // Singleton pattern - clone'lamayı engelle
    private function __clone()
    {
    }

    // Singleton pattern - unserialize'i engelle
    private function __wakeup()
    {
    }
}

// Global veritabanı bağlantısı
function getDB()
{
    return Database::getInstance()->getConnection();
}
?>