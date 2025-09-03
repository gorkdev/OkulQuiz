# OkulQuiz Backend - MySQL API

Bu klasör, OkulQuiz projesinin MySQL veritabanı ile çalışan backend API'sini içerir.

## 📁 Klasör Yapısı

```
backend/
├── config/
│   └── database.php          # Veritabanı bağlantı konfigürasyonu
├── utils/
│   └── ResponseHandler.php   # API yanıt handler sınıfı
├── services/
│   ├── SchoolService.php     # Okul işlemleri servisi
│   ├── CategoryService.php   # Kategori işlemleri servisi
│   ├── QuestionService.php   # Soru işlemleri servisi
│   ├── QuizService.php       # Quiz işlemleri servisi
│   └── LogService.php        # Log işlemleri servisi
├── api/
│   ├── schools.php           # Okul API endpoint'leri
│   ├── categories.php        # Kategori API endpoint'leri
│   ├── questions.php         # Soru API endpoint'leri
│   ├── quizzes.php           # Quiz API endpoint'leri
│   └── logs.php              # Log API endpoint'leri
├── database/
│   └── schema.sql            # Veritabanı şeması
└── README.md                 # Bu dosya
```

## 🚀 Kurulum

### 1. Veritabanı Kurulumu

1. MySQL veritabanınızda `backend/database/schema.sql` dosyasını çalıştırın:

```sql
source backend/database/schema.sql
```

2. Veritabanı bağlantı bilgilerini `config/database.php` dosyasında güncelleyin:

```php
private $host = 'localhost';
private $dbname = 'okulquiz_db';
private $username = 'root';
private $password = '';
```

### 2. Web Sunucusu Konfigürasyonu

WAMP/XAMPP kullanıyorsanız, projeyi `www` klasörüne kopyalayın ve şu URL'den erişin:

```
http://localhost/OkulQuiz/backend/api/schools.php
```

## 📚 API Endpoint'leri

### Okullar API

**Base URL:** `http://localhost/OkulQuiz/backend/api/schools.php`

| Method | Endpoint                         | Açıklama              |
| ------ | -------------------------------- | --------------------- |
| GET    | `/schools.php`                   | Tüm okulları getir    |
| GET    | `/schools.php?page=1&pageSize=6` | Sayfalı okullar getir |
| GET    | `/schools.php?id=1`              | ID'ye göre okul getir |
| POST   | `/schools.php`                   | Yeni okul ekle        |
| PUT    | `/schools.php?id=1`              | Okul güncelle         |
| DELETE | `/schools.php?id=1`              | Okul sil              |

### Kategoriler API

**Base URL:** `http://localhost/OkulQuiz/backend/api/categories.php`

| Method | Endpoint                            | Açıklama                  |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/categories.php`                   | Tüm kategorileri getir    |
| GET    | `/categories.php?page=1&pageSize=6` | Sayfalı kategoriler getir |
| GET    | `/categories.php?active=true`       | Aktif kategoriler getir   |
| GET    | `/categories.php?id=1`              | ID'ye göre kategori getir |
| POST   | `/categories.php`                   | Yeni kategori ekle        |
| PUT    | `/categories.php?id=1`              | Kategori güncelle         |
| DELETE | `/categories.php?id=1`              | Kategori sil              |

### Sorular API

**Base URL:** `http://localhost/OkulQuiz/backend/api/questions.php`

| Method | Endpoint                              | Açıklama                      |
| ------ | ------------------------------------- | ----------------------------- |
| GET    | `/questions.php`                      | Tüm soruları getir            |
| GET    | `/questions.php?page=1&pageSize=10`   | Sayfalı sorular getir         |
| GET    | `/questions.php?search=matematik`     | Sorularda arama yap           |
| GET    | `/questions.php?category=1`           | Kategoriye göre sorular getir |
| GET    | `/questions.php?random=true&count=10` | Rastgele sorular getir        |
| GET    | `/questions.php?id=1`                 | ID'ye göre soru getir         |
| POST   | `/questions.php`                      | Yeni soru ekle                |
| PUT    | `/questions.php?id=1`                 | Soru güncelle                 |
| DELETE | `/questions.php?id=1`                 | Soru sil                      |

## 🔧 Özellikler

### ✅ Güvenlik

- PDO prepared statements ile SQL injection koruması
- Input validation ve sanitization
- CORS desteği
- Hata yönetimi

### ✅ Performans

- Veritabanı indeksleri
- Sayfalama (pagination) desteği
- JSON response formatı
- UTF-8 karakter desteği

### ✅ Özellikler

- CRUD işlemleri (Create, Read, Update, Delete)
- Arama fonksiyonları
- Filtreleme seçenekleri
- Log sistemi
- İstatistikler

## 📝 Örnek Kullanım

### Okul Ekleme

```javascript
const schoolData = {
  okulAdi: "Atatürk İlkokulu",
  okulTuru: "devlet",
  adres: "Merkez Mahallesi, Atatürk Caddesi No:1",
  ilce: "Merkez",
  il: "Ankara",
  eposta: "ataturk@okul.com",
  telefon: "0312 123 45 67",
  ogrenciSayisi: "500",
  kullaniciAdi: "ataturk_okul",
  sifre: "12345678",
};

const response = await fetch(
  "http://localhost/OkulQuiz/backend/api/schools.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolData),
  }
);

const result = await response.json();
console.log(result);
```

### Okulları Listeleme

```javascript
const response = await fetch(
  "http://localhost/OkulQuiz/backend/api/schools.php?page=1&pageSize=6"
);
const result = await response.json();

if (result.success) {
  console.log("Okullar:", result.data.schools);
  console.log("Sayfalama:", result.data.pagination);
}
```

## 🔄 React Entegrasyonu

Frontend'de MySQL servislerini kullanmak için `src/services/mysql/` klasöründeki JavaScript servislerini kullanın:

```javascript
import { addSchool, getSchools } from "@/services/mysql/schoolService";

// Okul ekle
const newSchool = await addSchool(schoolData);

// Okulları getir
const schools = await getSchools();
```

## 🛠️ Geliştirme

### Yeni Servis Ekleme

1. `services/` klasöründe yeni servis sınıfı oluşturun
2. `api/` klasöründe endpoint dosyası oluşturun
3. `src/services/mysql/` klasöründe JavaScript wrapper oluşturun

### Veritabanı Değişiklikleri

1. `database/schema.sql` dosyasını güncelleyin
2. İlgili servis sınıflarını güncelleyin
3. API endpoint'lerini test edin

## 🐛 Hata Ayıklama

### Log Dosyaları

PHP hata loglarını kontrol edin:

- WAMP: `C:\wamp64\logs\php_error.log`
- XAMPP: `C:\xampp\php\logs\php_error.log`

### Veritabanı Bağlantısı

`config/database.php` dosyasındaki bağlantı bilgilerini kontrol edin.

### API Test

Postman veya benzeri bir API test aracı kullanarak endpoint'leri test edin.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
