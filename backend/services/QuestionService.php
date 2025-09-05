<?php
/**
 * Soru Servisi - MySQL Versiyonu
 * Firebase questionService.js'in PHP PDO ile yeniden yazılmış hali
 */

require_once '../config/database.php';
require_once '../utils/ResponseHandler.php';

class QuestionService
{
    private $db;

    public function __construct()
    {
        $this->db = getDB();
    }

    /**
     * Multipart/form-data ile dosya yüklemeli soru ekler (CSV şıklar)
     * @param array $post
     * @param array $files
     */
    public function addQuestionWithFiles($post, $files)
    {
        try {
            $this->db->beginTransaction();

            $separator = '||';

            $kategoriId = (int) ($post['kategori_id'] ?? 0);
            $soruMetni = trim($post['soru_metni'] ?? '');
            $zorluk = $post['zorluk'] ?? 'orta'; // 'kolay' | 'orta' | 'zor'

            // Checkbox/flag alanları
            $sureVar = $this->asBool($post['sure_var'] ?? 1);
            $sureSaniye = $post['sure_saniye'] !== null && $post['sure_saniye'] !== '' ? (int) $post['sure_saniye'] : null;
            $puanVar = $this->asBool($post['puan_var'] ?? 1);
            $puanDegeri = $post['puan_degeri'] !== null && $post['puan_degeri'] !== '' ? (int) $post['puan_degeri'] : null;
            $soruZorunlu = $this->asBool($post['soru_zorunlu'] ?? 1);
            $soruMetniVar = $this->asBool($post['soru_metni_var'] ?? 1);
            $soruGorseliVar = $this->asBool($post['soru_gorseli_var'] ?? 0);
            $soruSesiVar = $this->asBool($post['soru_sesi_var'] ?? 0);
            $geriBildirimVar = $this->asBool($post['geri_bildirim_var'] ?? 0);
            $aciklama = $geriBildirimVar ? ($post['aciklama'] ?? null) : null;
            $ipucuVar = $this->asBool($post['ipucu_var'] ?? 0);
            $ipucu = $ipucuVar ? ($post['ipucu'] ?? null) : null;
            $siraliSiklar = $this->asBool($post['sirali_siklar'] ?? 0);
            $siklariKaristir = $this->asBool($post['siklari_karistir'] ?? 0);
            $hedefYas = $post['hedef_yas'] !== null && $post['hedef_yas'] !== '' ? (int) $post['hedef_yas'] : null;
            $durum = $post['durum'] ?? 'aktif';

            if ($kategoriId <= 0) {
                ResponseHandler::validationError(['Kategori seçimi zorunludur']);
            }
            // En az bir içerik şartı: (metin) veya (görsel) veya (ses)
            $hasTextProvided = $soruMetni !== '';
            $hasImageProvided = isset($files['soru_resim']) && $files['soru_resim']['error'] === UPLOAD_ERR_OK;
            $hasAudioProvided = isset($files['soru_ses']) && $files['soru_ses']['error'] === UPLOAD_ERR_OK;
            if (!($hasTextProvided || $hasImageProvided || $hasAudioProvided)) {
                ResponseHandler::validationError(['En az bir içerik (metin, görsel veya ses) eklemelisiniz']);
            }

            // Şıklar: metinler POST ile dizi; medya dosyaları files içinde diziler
            $optionTexts = $post['secenekler_metin'] ?? $post['options_text'] ?? [];
            if (!is_array($optionTexts)) {
                $optionTexts = [];
            }
            // Şık görselleri (çoklu)
            $optionImages = $this->collectMultiFiles($files, 'secenekler_resim');
            // Şık sesleri (çoklu)
            $optionAudios = $this->collectMultiFiles($files, 'secenekler_ses');

            $optionCount = max(count($optionTexts), count($optionImages), count($optionAudios));
            if ($optionCount < 2) {
                ResponseHandler::validationError(['En az iki şık gereklidir']);
            }

            // 1) Önce temel kaydı ekle, medya alanlarını sonra güncellemek üzere boş bırak
            $sqlInit = "INSERT INTO sorular (
                kategori_id, soru_metni, aciklama, zorluk,
                sure_var, sure_saniye, puan_var, puan_degeri,
                soru_zorunlu, soru_metni_var, soru_gorseli_var, soru_sesi_var,
                geri_bildirim_var, ipucu_var, ipucu, sirali_siklar, siklari_karistir, hedef_yas,
                durum, created_at
            ) VALUES (
                :kategori_id, :soru_metni, :aciklama, :zorluk,
                :sure_var, :sure_saniye, :puan_var, :puan_degeri,
                :soru_zorunlu, :soru_metni_var, :soru_gorseli_var, :soru_sesi_var,
                :geri_bildirim_var, :ipucu_var, :ipucu, :sirali_siklar, :siklari_karistir, :hedef_yas,
                :durum, NOW()
            )";

            $stmt0 = $this->db->prepare($sqlInit);
            $stmt0->execute([
                ':kategori_id' => $kategoriId,
                ':soru_metni' => $soruMetni !== '' ? $soruMetni : null,
                ':aciklama' => $aciklama,
                ':zorluk' => $zorluk,
                ':sure_var' => $sureVar ? 1 : 0,
                ':sure_saniye' => $sureVar ? $sureSaniye : null,
                ':puan_var' => $puanVar ? 1 : 0,
                ':puan_degeri' => $puanDegeri ? $puanDegeri : null,
                ':soru_zorunlu' => $soruZorunlu ? 1 : 0,
                ':soru_metni_var' => $soruMetniVar ? 1 : 0,
                ':soru_gorseli_var' => $soruGorseliVar ? 1 : 0,
                ':soru_sesi_var' => $soruSesiVar ? 1 : 0,
                ':geri_bildirim_var' => $geriBildirimVar ? 1 : 0,
                ':ipucu_var' => $ipucuVar ? 1 : 0,
                ':ipucu' => $ipucu,
                ':sirali_siklar' => $siraliSiklar ? 1 : 0,
                ':siklari_karistir' => $siklariKaristir ? 1 : 0,
                ':hedef_yas' => $hedefYas,
                ':durum' => $durum
            ]);

            $questionId = (int) $this->db->lastInsertId();

            // 2) Klasörleri question_<id> altında hazırla (yalnız ihtiyaç olduğunda oluşturulacak)
            $baseUploadDir = realpath(__DIR__ . '/../uploads');
            if ($baseUploadDir === false) {
                $baseUploadDir = __DIR__ . '/../uploads';
            }
            $rootDir = $baseUploadDir . '/questions/question_' . $questionId;
            $questionMediaDir = $rootDir . '/soru';
            $optionsMediaDir = $rootDir . '/secenekler';

            // 3) Medyaları uygun klasörlere kaydet (saveUploadedFile hedef klasörü kendisi oluşturur)
            $soruResimUrl = null;
            if ($soruGorseliVar && isset($files['soru_resim']) && $files['soru_resim']['error'] === UPLOAD_ERR_OK) {
                $soruResimUrl = $this->saveUploadedFile($files['soru_resim'], $questionMediaDir, ['jpg', 'jpeg', 'png', 'webp']);
            }
            $soruSesUrl = null;
            if ($soruSesiVar && isset($files['soru_ses']) && $files['soru_ses']['error'] === UPLOAD_ERR_OK) {
                $soruSesUrl = $this->saveUploadedFile($files['soru_ses'], $questionMediaDir, ['mp3', 'mpeg', 'mpga', 'm4a', 'wav', 'ogg']);
            }

            $optionImageUrls = [];
            $optionAudioUrls = [];
            for ($i = 0; $i < $optionCount; $i++) {
                $optionTexts[$i] = isset($optionTexts[$i]) ? trim((string) $optionTexts[$i]) : '';
                if (isset($optionImages[$i]) && $optionImages[$i]['error'] === UPLOAD_ERR_OK) {
                    $optionImageUrls[$i] = $this->saveUploadedFile($optionImages[$i], $optionsMediaDir, ['jpg', 'jpeg', 'png', 'webp']);
                } else {
                    $optionImageUrls[$i] = '';
                }
                if (isset($optionAudios[$i]) && $optionAudios[$i]['error'] === UPLOAD_ERR_OK) {
                    $optionAudioUrls[$i] = $this->saveUploadedFile($optionAudios[$i], $optionsMediaDir, ['mp3', 'mpeg', 'mpga', 'm4a', 'wav', 'ogg']);
                } else {
                    $optionAudioUrls[$i] = '';
                }
            }

            // Doğru indeksler
            $correctIndexes = $post['dogru_indeksler'] ?? $post['correct_indexes'] ?? [];
            if (!is_array($correctIndexes)) {
                $correctIndexes = $correctIndexes !== '' ? [(int) $correctIndexes] : [];
            }
            $correctIndexes = array_values(array_filter(array_map('intval', $correctIndexes), function ($v) use ($optionCount) {
                return $v >= 0 && $v < $optionCount;
            }));

            $seceneklerMetinCsv = $this->joinCsv($optionTexts, $separator);
            $seceneklerResimCsv = $this->joinCsv($optionImageUrls, $separator);
            $seceneklerSesCsv = $this->joinCsv($optionAudioUrls, $separator);
            $dogruIndekslerCsv = implode(',', $correctIndexes);

            // 4) Kayıtı medya yolları ve CSV'lerle güncelle
            $sqlUpdate = "UPDATE sorular SET 
                soru_resim_url = :soru_resim_url,
                soru_ses_url = :soru_ses_url,
                secenek_sayisi = :secenek_sayisi,
                secenekler_metin_csv = :secenekler_metin_csv,
                secenekler_resim_csv = :secenekler_resim_csv,
                secenekler_ses_csv = :secenekler_ses_csv,
                dogru_indeksler_csv = :dogru_indeksler_csv
            WHERE id = :id";
            $stmtU = $this->db->prepare($sqlUpdate);
            $stmtU->execute([
                ':soru_resim_url' => $soruResimUrl,
                ':soru_ses_url' => $soruSesUrl,
                ':secenek_sayisi' => $optionCount,
                ':secenekler_metin_csv' => $seceneklerMetinCsv,
                ':secenekler_resim_csv' => $seceneklerResimCsv,
                ':secenekler_ses_csv' => $seceneklerSesCsv,
                ':dogru_indeksler_csv' => $dogruIndekslerCsv,
                ':id' => $questionId
            ]);

            $this->db->commit();

            $created = $this->getQuestionById($questionId);
            ResponseHandler::success($created, 'Soru başarıyla eklendi', 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            ResponseHandler::error('Soru eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    private function asBool($v)
    {
        if (is_bool($v))
            return $v;
        $s = strtolower((string) $v);
        return in_array($s, ['1', 'true', 'on', 'yes', 'evet'], true);
    }

    private function ensureDir($dir)
    {
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0777, true) && !is_dir($dir)) {
                throw new Exception('Yükleme klasörü oluşturulamadı: ' . $dir);
            }
        }
    }

    private function joinCsv(array $values, $separator = '||')
    {
        // Null/undefined değerleri boş stringe çevir, trim'le
        $clean = array_map(function ($v) {
            if ($v === null)
                return '';
            $s = (string) $v;
            // Ayracı verinin içinde görürsek kaçışlayabiliriz (basit yaklaşım: değiştir)
            return trim($s);
        }, $values);
        return implode($separator, $clean);
    }

    private function saveUploadedFile($file, $targetDir, $allowedExts = [])
    {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Dosya yükleme hatası');
        }
        $this->ensureDir($targetDir);
        $original = $file['name'];
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        // MIME tespit et (varsa)
        $mime = null;
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo) {
                $mime = finfo_file($finfo, $file['tmp_name']);
                finfo_close($finfo);
            }
        }
        if ($allowedExts && !in_array($ext, $allowedExts, true)) {
            // Ses dosyaları için MIME kontrolü ile izin ver
            if (!(is_string($mime) && strpos($mime, 'audio/') === 0)) {
                throw new Exception('İzin verilmeyen dosya türü: ' . $ext . ' (mime: ' . ($mime ?: 'bilinmiyor') . ')');
            }
        }
        $safeName = uniqid('f_', true) . '.' . $ext;
        $dest = rtrim($targetDir, '/\\') . '/' . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new Exception('Dosya taşınamadı');
        }
        // Dönen değer: uploads/... göreli yol
        $uploadsRoot = realpath(__DIR__ . '/../uploads');
        if ($uploadsRoot === false) {
            $uploadsRoot = __DIR__ . '/../uploads';
        }
        $relative = str_replace(['\\'], '/', str_replace($uploadsRoot, 'uploads', $dest));
        return $relative;
    }

    private function collectMultiFiles($files, $field)
    {
        $result = [];
        if (!isset($files[$field]))
            return $result;
        $f = $files[$field];
        if (is_array($f['name'])) {
            $count = count($f['name']);
            for ($i = 0; $i < $count; $i++) {
                $result[$i] = [
                    'name' => $f['name'][$i],
                    'type' => $f['type'][$i],
                    'tmp_name' => $f['tmp_name'][$i],
                    'error' => $f['error'][$i],
                    'size' => $f['size'][$i],
                ];
            }
        } else {
            $result[0] = $f;
        }
        return $result;
    }

    /**
     * Yeni soru ekler
     * @param array $questionData - Soru bilgileri
     * @return array - Eklenen soru bilgileri
     */
    public function addQuestion($questionData)
    {
        try {
            // Validation
            $this->validateQuestionData($questionData);

            $sql = "INSERT INTO sorular (
                kategori_id, soru_metni, secenek_a, secenek_b, secenek_c, secenek_d,
                dogru_cevap, aciklama, zorluk_seviyesi, resim_url, durum, created_at
            ) VALUES (
                :kategori_id, :soru_metni, :secenek_a, :secenek_b, :secenek_c, :secenek_d,
                :dogru_cevap, :aciklama, :zorluk_seviyesi, :resim_url, :durum, NOW()
            )";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':kategori_id' => $questionData['kategoriId'],
                ':soru_metni' => $questionData['soruMetni'],
                ':secenek_a' => $questionData['secenekA'],
                ':secenek_b' => $questionData['secenekB'],
                ':secenek_c' => $questionData['secenekC'],
                ':secenek_d' => $questionData['secenekD'],
                ':dogru_cevap' => $questionData['dogruCevap'],
                ':aciklama' => $questionData['aciklama'] ?? null,
                ':zorluk_seviyesi' => $questionData['zorlukSeviyesi'] ?? 'orta',
                ':resim_url' => $questionData['resimUrl'] ?? null,
                ':durum' => $questionData['durum'] ?? 'aktif'
            ]);

            $questionId = $this->db->lastInsertId();

            // Log kaydı
            $this->addLog('Yeni Soru Eklendi', "Yeni soru eklendi. ID: {$questionId}");

            // Eklenen soruyu getir
            $addedQuestion = $this->getQuestionById($questionId);

            ResponseHandler::success($addedQuestion, 'Soru başarıyla eklendi', 201);

        } catch (Exception $e) {
            ResponseHandler::error('Soru eklenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soruları sayfalı olarak getirir
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @param string $search - Arama terimi
     * @return array - Sayfalı sorular listesi
     */
    public function getQuestionsPaginated($page = 1, $pageSize = 10, $search = "")
    {
        try {
            $offset = ($page - 1) * $pageSize;
            $whereClause = "";
            $params = [];

            // Arama terimi varsa WHERE koşulu ekle
            if (!empty($search)) {
                $whereClause = "WHERE s.soru_metni LIKE :search 
                                OR s.secenek_a LIKE :search 
                                OR s.secenek_b LIKE :search 
                                OR s.secenek_c LIKE :search 
                                OR s.secenek_d LIKE :search 
                                OR k.kategori_adi LIKE :search";
                $params[':search'] = "%{$search}%";
            }

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM sorular s 
                        LEFT JOIN kategoriler k ON s.kategori_id = k.id {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al (kategori bilgileriyle birlikte)
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    {$whereClause}
                    ORDER BY s.created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);

            // Arama parametrelerini bind et
            if (!empty($params)) {
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value);
                }
            }

            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $questions = $stmt->fetchAll();

            $result = [
                'questions' => $questions,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            ResponseHandler::success($result, 'Sorular başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Sorular getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Sorularda arama yapar
     * @param string $search - Arama terimi
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @return array - Arama sonuçları
     */
    public function searchQuestions($search = '', $page = 1, $pageSize = 10)
    {
        try {
            $offset = ($page - 1) * $pageSize;

            if (empty($search)) {
                // Arama yoksa normal paginated çek
                return $this->getQuestionsPaginated($page, $pageSize);
            }

            $searchTerm = "%{$search}%";

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM sorular s 
                        LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                        WHERE s.soru_metni LIKE :search 
                        OR s.secenek_a LIKE :search 
                        OR s.secenek_b LIKE :search 
                        OR s.secenek_c LIKE :search 
                        OR s.secenek_d LIKE :search 
                        OR k.kategori_adi LIKE :search";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':search' => $searchTerm]);
            $totalCount = $countStmt->fetch()['total'];

            // Arama sonuçlarını al
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE s.soru_metni LIKE :search 
                    OR s.secenek_a LIKE :search 
                    OR s.secenek_b LIKE :search 
                    OR s.secenek_c LIKE :search 
                    OR s.secenek_d LIKE :search 
                    OR k.kategori_adi LIKE :search 
                    ORDER BY s.created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':search', $searchTerm);
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $questions = $stmt->fetchAll();

            $result = [
                'questions' => $questions,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ],
                'search_term' => $search
            ];

            ResponseHandler::success($result, 'Arama sonuçları başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Arama yapılırken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * ID'ye göre soru getirir
     * @param int $questionId - Soru ID'si
     * @return array - Soru bilgileri
     */
    public function getQuestionById($questionId)
    {
        try {
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE s.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $questionId]);

            $question = $stmt->fetch();

            if (!$question) {
                ResponseHandler::notFound('Soru bulunamadı');
            }

            return $question;

        } catch (Exception $e) {
            ResponseHandler::error('Soru getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soru günceller
     * @param int $questionId - Soru ID'si
     * @param array $questionData - Güncellenecek veriler
     * @return array - Güncellenmiş soru bilgileri
     */
    public function updateQuestion($questionId, $questionData)
    {
        try {
            // Sorunun var olup olmadığını kontrol et
            $existingQuestion = $this->getQuestionById($questionId);

            $updateFields = [];
            $params = [':id' => $questionId];

            // Güncellenecek alanları hazırla
            $fieldMappings = [
                'kategoriId' => 'kategori_id',
                'soruMetni' => 'soru_metni',
                'secenekA' => 'secenek_a',
                'secenekB' => 'secenek_b',
                'secenekC' => 'secenek_c',
                'secenekD' => 'secenek_d',
                'dogruCevap' => 'dogru_cevap',
                'aciklama' => 'aciklama',
                'zorlukSeviyesi' => 'zorluk_seviyesi',
                'resimUrl' => 'resim_url',
                'durum' => 'durum'
            ];

            foreach ($fieldMappings as $inputField => $dbField) {
                if (isset($questionData[$inputField])) {
                    $updateFields[] = "{$dbField} = :{$dbField}";
                    $params[":{$dbField}"] = $questionData[$inputField];
                }
            }

            if (empty($updateFields)) {
                ResponseHandler::error('Güncellenecek alan bulunamadı');
            }

            $sql = "UPDATE sorular SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // Log kaydı
            $this->addLog('Soru Güncellendi', "Soru güncellendi. ID: {$questionId}");

            // Güncellenmiş soruyu getir
            $updatedQuestion = $this->getQuestionById($questionId);

            ResponseHandler::success($updatedQuestion, 'Soru başarıyla güncellendi');

        } catch (Exception $e) {
            ResponseHandler::error('Soru güncellenirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soru siler
     * @param int $questionId - Soru ID'si
     * @return void
     */
    public function deleteQuestion($questionId)
    {
        try {
            // Sorunun var olup olmadığını kontrol et
            $existingQuestion = $this->getQuestionById($questionId);

            // Dosyaları sil
            $this->deleteQuestionFiles($questionId);

            $sql = "DELETE FROM sorular WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $questionId]);

            // Log kaydı
            $this->addLog('Soru Silindi', "Soru silindi. ID: {$questionId}");

            ResponseHandler::success(null, 'Soru başarıyla silindi');

        } catch (Exception $e) {
            ResponseHandler::error('Soru silinirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soruya ait dosyaları siler
     * @param int $questionId - Soru ID'si
     */
    private function deleteQuestionFiles($questionId)
    {
        try {
            $baseUploadDir = realpath(__DIR__ . '/../uploads');
            if ($baseUploadDir === false) {
                $baseUploadDir = __DIR__ . '/../uploads';
            }

            $questionDir = $baseUploadDir . '/questions/question_' . $questionId;

            if (is_dir($questionDir)) {
                $this->deleteDirectory($questionDir);
            }
        } catch (Exception $e) {
            // Dosya silme hatası ana işlemi etkilemesin
            error_log("Dosya silme hatası: " . $e->getMessage());
        }
    }

    /**
     * Klasörü ve içindeki tüm dosyaları siler
     * @param string $dir - Silinecek klasör yolu
     */
    private function deleteDirectory($dir)
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), array('.', '..'));

        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->deleteDirectory($path);
            } else {
                unlink($path);
            }
        }

        rmdir($dir);
    }

    /**
     * Kategoriye göre soruları getirir
     * @param int $categoryId - Kategori ID'si
     * @param int $page - Sayfa numarası
     * @param int $pageSize - Sayfa başına kayıt sayısı
     * @return array - Kategori soruları
     */
    public function getQuestionsByCategory($categoryId, $page = 1, $pageSize = 10)
    {
        try {
            $offset = ($page - 1) * $pageSize;

            // Toplam kayıt sayısını al
            $countSql = "SELECT COUNT(*) as total FROM sorular WHERE kategori_id = :category_id";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute([':category_id' => $categoryId]);
            $totalCount = $countStmt->fetch()['total'];

            // Sayfalı verileri al
            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE s.kategori_id = :category_id 
                    ORDER BY s.created_at DESC 
                    LIMIT :limit OFFSET :offset";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $pageSize, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $questions = $stmt->fetchAll();

            $result = [
                'questions' => $questions,
                'pagination' => [
                    'current_page' => $page,
                    'page_size' => $pageSize,
                    'total_count' => $totalCount,
                    'total_pages' => ceil($totalCount / $pageSize),
                    'has_more' => ($page * $pageSize) < $totalCount
                ]
            ];

            ResponseHandler::success($result, 'Kategori soruları başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Kategori soruları getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Rastgele sorular getirir (quiz için)
     * @param int $categoryId - Kategori ID'si (opsiyonel)
     * @param int $count - Soru sayısı
     * @param string $difficulty - Zorluk seviyesi (opsiyonel)
     * @return array - Rastgele sorular
     */
    public function getRandomQuestions($categoryId = null, $count = 10, $difficulty = null)
    {
        try {
            $whereConditions = ["s.durum = 'aktif'"];
            $params = [];

            if ($categoryId) {
                $whereConditions[] = "s.kategori_id = :category_id";
                $params[':category_id'] = $categoryId;
            }

            if ($difficulty) {
                $whereConditions[] = "s.zorluk_seviyesi = :difficulty";
                $params[':difficulty'] = $difficulty;
            }

            $whereClause = implode(' AND ', $whereConditions);

            $sql = "SELECT s.*, k.kategori_adi 
                    FROM sorular s 
                    LEFT JOIN kategoriler k ON s.kategori_id = k.id 
                    WHERE {$whereClause} 
                    ORDER BY RAND() 
                    LIMIT :count";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':count', $count, PDO::PARAM_INT);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $questions = $stmt->fetchAll();

            ResponseHandler::success($questions, 'Rastgele sorular başarıyla getirildi');

        } catch (Exception $e) {
            ResponseHandler::error('Rastgele sorular getirilirken hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Soru verilerini validate eder
     * @param array $questionData - Soru verileri
     * @throws Exception - Validation hatası
     */
    private function validateQuestionData($questionData)
    {
        $errors = [];

        if (empty($questionData['kategoriId'])) {
            $errors[] = 'Kategori seçimi zorunludur';
        }

        if (empty($questionData['soruMetni'])) {
            $errors[] = 'Soru metni zorunludur';
        }

        if (empty($questionData['secenekA'])) {
            $errors[] = 'A seçeneği zorunludur';
        }

        if (empty($questionData['secenekB'])) {
            $errors[] = 'B seçeneği zorunludur';
        }

        if (empty($questionData['secenekC'])) {
            $errors[] = 'C seçeneği zorunludur';
        }

        if (empty($questionData['secenekD'])) {
            $errors[] = 'D seçeneği zorunludur';
        }

        if (empty($questionData['dogruCevap'])) {
            $errors[] = 'Doğru cevap seçimi zorunludur';
        }

        // Doğru cevap geçerli bir seçenek mi kontrol et
        $validAnswers = ['A', 'B', 'C', 'D'];
        if (!in_array($questionData['dogruCevap'], $validAnswers)) {
            $errors[] = 'Doğru cevap A, B, C veya D olmalıdır';
        }

        if (!empty($errors)) {
            ResponseHandler::validationError($errors);
        }
    }

    /**
     * Log kaydı ekler
     * @param string $title - Log başlığı
     * @param string $details - Log detayları
     */
    private function addLog($title, $details)
    {
        try {
            $sql = "INSERT INTO logs (title, details, created_at) VALUES (:title, :details, NOW())";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':title' => $title,
                ':details' => $details
            ]);
        } catch (Exception $e) {
            // Log hatası ana işlemi etkilemesin
            error_log("Log kaydı hatası: " . $e->getMessage());
        }
    }
}
?>