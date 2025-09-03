-- OkulQuiz Veritabanı Şeması
-- MySQL 8.0+ için optimize edilmiş

-- Veritabanını oluştur
CREATE DATABASE IF NOT EXISTS minikup_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE minikup_db;

-- Okullar tablosu
CREATE TABLE IF NOT EXISTS okullar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    okul_adi VARCHAR(255) NOT NULL,
    okul_turu ENUM('devlet', 'özel') NOT NULL DEFAULT 'devlet',
    adres TEXT NOT NULL,
    ilce VARCHAR(100) NOT NULL,
    il VARCHAR(100) NOT NULL,
    eposta VARCHAR(255) NOT NULL UNIQUE,
    telefon VARCHAR(20) NOT NULL,
    website VARCHAR(255) NULL,
    ogrenci_sayisi VARCHAR(50) NOT NULL,
    gorusulecek_yetkili VARCHAR(255) NULL,
    yetkili_telefon VARCHAR(20) NULL,
    durum ENUM('aktif', 'pasif') NOT NULL DEFAULT 'aktif',
    kullanici_adi VARCHAR(100) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_okul_adi (okul_adi),
    INDEX idx_il (il),
    INDEX idx_durum (durum),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS kategoriler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_adi VARCHAR(100) NOT NULL UNIQUE,
    aciklama TEXT NULL,
    durum ENUM('aktif', 'pasif') NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_kategori_adi (kategori_adi),
    INDEX idx_durum (durum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sorular tablosu
CREATE TABLE IF NOT EXISTS sorular (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT NOT NULL,
    soru_metni TEXT NOT NULL,
    secenek_a TEXT NOT NULL,
    secenek_b TEXT NOT NULL,
    secenek_c TEXT NOT NULL,
    secenek_d TEXT NOT NULL,
    dogru_cevap ENUM('A', 'B', 'C', 'D') NOT NULL,
    aciklama TEXT NULL,
    zorluk_seviyesi ENUM('kolay', 'orta', 'zor') NOT NULL DEFAULT 'orta',
    resim_url VARCHAR(500) NULL,
    durum ENUM('aktif', 'pasif') NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE CASCADE,
    INDEX idx_kategori_id (kategori_id),
    INDEX idx_durum (durum),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_soru_arama (soru_metni, secenek_a, secenek_b, secenek_c, secenek_d)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quizler tablosu
CREATE TABLE IF NOT EXISTS quizler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_name VARCHAR(255) NOT NULL UNIQUE,
    category_order JSON NOT NULL,
    questions_by_category JSON NOT NULL,
    questions_random BOOLEAN NOT NULL DEFAULT FALSE,
    categories_random BOOLEAN NOT NULL DEFAULT FALSE,
    category_count INT NOT NULL DEFAULT 0,
    question_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_quiz_name (quiz_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz-Kategori ilişki tablosu
CREATE TABLE IF NOT EXISTS quiz_kategoriler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    kategori_id INT NOT NULL,
    sira INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizler(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quiz_kategori (quiz_id, kategori_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_kategori_id (kategori_id),
    INDEX idx_sira (sira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz-Soru ilişki tablosu
CREATE TABLE IF NOT EXISTS quiz_sorular (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    kategori_id INT NOT NULL,
    soru_id INT NOT NULL,
    sira INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizler(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE CASCADE,
    FOREIGN KEY (soru_id) REFERENCES sorular(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quiz_soru (quiz_id, soru_id),
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_kategori_id (kategori_id),
    INDEX idx_soru_id (soru_id),
    INDEX idx_sira (sira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loglar tablosu
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_title (title),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kullanıcılar tablosu (gelecekte kullanım için)
CREATE TABLE IF NOT EXISTS kullanicilar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_adi VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'ogretmen', 'ogrenci') NOT NULL DEFAULT 'ogrenci',
    okul_id INT NULL,
    durum ENUM('aktif', 'pasif') NOT NULL DEFAULT 'aktif',
    son_giris DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (okul_id) REFERENCES okullar(id) ON DELETE SET NULL,
    INDEX idx_kullanici_adi (kullanici_adi),
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_okul_id (okul_id),
    INDEX idx_durum (durum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz sonuçları tablosu (gelecekte kullanım için)
CREATE TABLE IF NOT EXISTS quiz_sonuclari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    kullanici_id INT NOT NULL,
    okul_id INT NULL,
    baslama_zamani DATETIME NOT NULL,
    bitis_zamani DATETIME NULL,
    dogru_sayisi INT NOT NULL DEFAULT 0,
    yanlis_sayisi INT NOT NULL DEFAULT 0,
    toplam_soru INT NOT NULL DEFAULT 0,
    puan DECIMAL(5,2) NULL,
    durum ENUM('devam_ediyor', 'tamamlandi', 'yarida_kesildi') NOT NULL DEFAULT 'devam_ediyor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizler(id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE,
    FOREIGN KEY (okul_id) REFERENCES okullar(id) ON DELETE SET NULL,
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_kullanici_id (kullanici_id),
    INDEX idx_okul_id (okul_id),
    INDEX idx_baslama_zamani (baslama_zamani),
    INDEX idx_durum (durum)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek veriler ekle
INSERT INTO kategoriler (kategori_adi, aciklama, durum) VALUES
('Matematik', 'Matematik dersi ile ilgili sorular', 'aktif'),
('Türkçe', 'Türkçe dersi ile ilgili sorular', 'aktif'),
('Fen Bilgisi', 'Fen bilgisi dersi ile ilgili sorular', 'aktif'),
('Sosyal Bilgiler', 'Sosyal bilgiler dersi ile ilgili sorular', 'aktif'),
('İngilizce', 'İngilizce dersi ile ilgili sorular', 'aktif');

-- Örnek sorular ekle
INSERT INTO sorular (kategori_id, soru_metni, secenek_a, secenek_b, secenek_c, secenek_d, dogru_cevap, aciklama, zorluk_seviyesi) VALUES
(1, '2 + 2 kaçtır?', '3', '4', '5', '6', 'B', 'Temel matematik sorusu', 'kolay'),
(1, '5 x 6 kaçtır?', '25', '30', '35', '40', 'B', 'Çarpma işlemi', 'orta'),
(2, 'Türkçe alfabesinde kaç harf vardır?', '27', '28', '29', '30', 'C', 'Alfabe bilgisi', 'orta'),
(3, 'Su kaç derecede kaynar?', '90°C', '100°C', '110°C', '120°C', 'B', 'Fizik bilgisi', 'orta'),
(4, 'Türkiye\'nin başkenti neresidir?', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'B', 'Coğrafya bilgisi', 'kolay');

-- Örnek okul ekle
INSERT INTO okullar (okul_adi, okul_turu, adres, ilce, il, eposta, telefon, ogrenci_sayisi, kullanici_adi, sifre) VALUES
('Örnek İlkokulu', 'devlet', 'Örnek Mahallesi, Test Sokak No:1', 'Merkez', 'Ankara', 'ornek@okul.com', '0312 123 45 67', '500', 'school1234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Örnek log ekle
INSERT INTO logs (title, details) VALUES
('Sistem Başlatıldı', 'Veritabanı şeması oluşturuldu ve örnek veriler eklendi.');
