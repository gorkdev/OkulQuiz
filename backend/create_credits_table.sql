-- Krediler tablosu oluşturma
USE minikup_db;

CREATE TABLE IF NOT EXISTS krediler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    okul_adi VARCHAR(255) NOT NULL,
    kredi_miktari INT NOT NULL,
    aciklama TEXT,
    durum ENUM('aktif', 'pasif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Örnek kredi verileri ekleme
INSERT INTO krediler (okul_adi, kredi_miktari, aciklama, durum) VALUES
('Atatürk İlkokulu', 100, 'Eğitim desteği kredisi', 'aktif'),
('Cumhuriyet Ortaokulu', 150, 'Teknoloji altyapı kredisi', 'aktif'),
('Fatih Anadolu Lisesi', 200, 'Laboratuvar ekipman kredisi', 'aktif'),
('Mehmet Akif Ersoy İlkokulu', 75, 'Kütüphane kredisi', 'aktif'),
('Yavuz Selim Ortaokulu', 120, 'Spor malzemesi kredisi', 'aktif'),
('Kanuni Sultan Süleyman Anadolu Lisesi', 180, 'Müzik aleti kredisi', 'aktif'),
('Barbaros Hayrettin İlkokulu', 90, 'Sanat malzemesi kredisi', 'aktif'),
('Mimar Sinan Ortaokulu', 110, 'Bilgisayar kredisi', 'aktif'),
('Piri Reis Anadolu Lisesi', 160, 'Fen laboratuvar kredisi', 'aktif'),
('Evliya Çelebi İlkokulu', 85, 'Oyun alanı kredisi', 'aktif');
