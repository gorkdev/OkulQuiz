<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ResponseHandler::error('Sadece POST istekleri kabul edilir', 405);
}

try {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        ResponseHandler::error('Dosya yüklenirken hata oluştu', 400);
    }

    $file = $_FILES['file'];
    $type = $_POST['type'] ?? 'general';
    $categoryId = $_POST['categoryId'] ?? 'temp';

    // Kategori klasörü oluştur
    $categoryFolder = "category_{$categoryId}";

    $allowedTypes = [
        'audios' => ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
        'images' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'sliders' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    ];

    if (!isset($allowedTypes[$type])) {
        ResponseHandler::error('Geçersiz dosya türü', 400);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    // MIME type kontrolünü esnet
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExtensions = [
        'audios' => ['mp3', 'wav', 'ogg', 'mpeg'],
        'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'sliders' => ['jpg', 'jpeg', 'png', 'gif', 'webp']
    ];

    if (!in_array($extension, $allowedExtensions[$type])) {
        ResponseHandler::error('Desteklenmeyen dosya formatı', 400);
    }

    $maxSize = 10 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        ResponseHandler::error('Dosya boyutu çok büyük (max 10MB)', 400);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $safeFileName = uniqid() . '_' . time() . '.' . $extension;

    $uploadDir = "../uploads/categories/{$categoryFolder}/{$type}";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $uploadPath = $uploadDir . '/' . $safeFileName;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        $webPath = "uploads/categories/{$categoryFolder}/{$type}/{$safeFileName}";

        ResponseHandler::success([
            'filename' => $safeFileName,
            'path' => $webPath,
            'size' => $file['size'],
            'type' => $mimeType
        ], 'Dosya başarıyla yüklendi');
    } else {
        ResponseHandler::error('Dosya kaydedilemedi', 500);
    }

} catch (Exception $e) {
    ResponseHandler::error('Upload hatası: ' . $e->getMessage(), 500);
}
?>