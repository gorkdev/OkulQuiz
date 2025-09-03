<?php
/**
 * API Yanıt Handler Sınıfı
 * Standart JSON yanıtları için
 */

class ResponseHandler
{

    /**
     * Başarılı yanıt döndürür
     * @param mixed $data - Yanıt verisi
     * @param string $message - Mesaj
     * @param int $statusCode - HTTP durum kodu
     */
    public static function success($data = null, $message = 'İşlem başarılı', $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Hata yanıtı döndürür
     * @param string $message - Hata mesajı
     * @param int $statusCode - HTTP durum kodu
     * @param mixed $errors - Hata detayları
     */
    public static function error($message = 'Bir hata oluştu', $statusCode = 400, $errors = null)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Validation hatası döndürür
     * @param array $errors - Validation hataları
     */
    public static function validationError($errors)
    {
        self::error('Validation hatası', 422, $errors);
    }

    /**
     * Yetkilendirme hatası döndürür
     * @param string $message - Hata mesajı
     */
    public static function unauthorized($message = 'Yetkisiz erişim')
    {
        self::error($message, 401);
    }

    /**
     * Bulunamadı hatası döndürür
     * @param string $message - Hata mesajı
     */
    public static function notFound($message = 'Kayıt bulunamadı')
    {
        self::error($message, 404);
    }
}
?>