-- Okullar tablosuna kredi alanı ekleme
-- Bu dosyayı MySQL'de çalıştırarak kredi alanını ekleyin

USE minikup_db;

-- Okullar tablosuna kredi alanı ekle
ALTER TABLE okullar 
ADD COLUMN kredi INT NOT NULL DEFAULT 0 
AFTER ogrenci_sayisi;

-- Kredi alanı için index ekle
CREATE INDEX idx_kredi ON okullar(kredi);

-- Mevcut okullara varsayılan kredi değeri ata
UPDATE okullar SET kredi = 0 WHERE kredi IS NULL;

-- Kredi alanının eklendiğini doğrula
DESCRIBE okullar;
