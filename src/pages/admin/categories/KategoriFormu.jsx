import React, { useState, useEffect } from "react";
import FormTemplate from "@/components/FormTemplate/FormTemplate";
import FormField from "@/components/FormTemplate/FormField";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import CustomCheckbox from "@/components/FormTemplate/CustomCheckbox";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
  addCategory,
  isCategoryNameTaken,
  uploadFile,
  updateCategory,
} from "@/services/mysql/categoryService";
// Firebase import'ları kaldırıldı - MySQL kullanıyoruz

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "pasif", label: "Pasif" },
];

const schema = yup.object().shape({
  kategoriAdi: yup.string().required("Kategori adı zorunludur"),
  aciklama: yup
    .string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional(),
  durum: yup.string().required("Durum seçilmeli"),
});

const defaultValues = {
  kategoriAdi: "",
  aciklama: "",
  durum: "aktif",
};

const KategoriFormu = ({ initialValues, onSubmit: onSubmitProp, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [sliderCount, setSliderCount] = useState(1);
  const [sliderFiles, setSliderFiles] = useState([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [showPreText, setShowPreText] = useState(false);
  const [preText, setPreText] = useState("");
  const [showPreAudio, setShowPreAudio] = useState(false);
  const [preAudio, setPreAudio] = useState(null);
  const [showPreImage, setShowPreImage] = useState(false);
  const [preImage, setPreImage] = useState(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Varsayılan değerleri doldur (edit için)
  useEffect(() => {
    if (initialValues) {
      setShowSlider(!!initialValues.kategoriBaslarkenSlider);
      setShowCountdown(!!initialValues.kategoriBaslarkenGeriyeSayim);
      setShowPreText(!!initialValues.kategoriBaslarkenMetin);
      setShowPreAudio(!!initialValues.kategoriBaslarkenSes);
      setShowPreImage(!!initialValues.kategoriBaslarkenResim);
      setAutoPlayAudio(!!initialValues.sesOtomatikOynatilsin);
      setPreText(initialValues.preText || "");
      setCountdownSeconds(initialValues.countdownSeconds || 3);
      // Slider sayısı otomatik ayarla
      if (
        Array.isArray(initialValues.sliderImages) &&
        initialValues.sliderImages.length > 0
      ) {
        setSliderCount(initialValues.sliderImages.length);
      }
      // Dosya alanları için ek kod gerekebilir (URL'den file'a dönüştürmek için)
    }
  }, [initialValues]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues || defaultValues,
    mode: "onChange",
  });

  const onSliderCountChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    setSliderCount(val);
    setSliderFiles((prev) => {
      if (val < prev.length) return prev.slice(0, val);
      return [...prev, ...Array(val - prev.length).fill(null)];
    });
  };

  const onSliderFileChange = (idx, file) => {
    setSliderFiles((prev) => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const onSliderCheckboxChange = (e) => {
    setShowSlider(e.target.checked);
    if (!e.target.checked) {
      setSliderFiles([]);
      setSliderCount(1);
    }
  };

  const onCountdownCheckboxChange = (e) => {
    setShowCountdown(e.target.checked);
    if (!e.target.checked) setCountdownSeconds(3);
  };
  const onCountdownSecondsChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    setCountdownSeconds(val);
  };

  const onPreTextCheckboxChange = (e) => {
    setShowPreText(e.target.checked);
    if (!e.target.checked) setPreText("");
  };
  const onPreAudioCheckboxChange = (e) => {
    setShowPreAudio(e.target.checked);
    if (!e.target.checked) setPreAudio(null);
  };
  const onPreImageCheckboxChange = (e) => {
    setShowPreImage(e.target.checked);
    if (!e.target.checked) setPreImage(null);
  };

  const onAutoPlayAudioChange = (e) => {
    setAutoPlayAudio(e.target.checked);
  };

  const uploadFileToStorage = async (file, type, categoryId = "temp") => {
    if (!file) return null;
    try {
      const result = await uploadFile(file, type, categoryId);
      return result.path;
    } catch (error) {
      console.error("Dosya upload hatası:", error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!isEdit) {
        const taken = await isCategoryNameTaken(data.kategoriAdi);
        if (taken) {
          toast.error("Bu kategori adı zaten kullanılıyor.");
          setLoading(false);
          return;
        }
      }
      // Dosya yükleme işlemleri
      let sliderImageUrls = [];
      let preAudioUrl = null;
      let preImageUrl = null;

      if (isEdit) {
        // Güncelleme modunda: yeni dosya varsa yükle, yoksa eski URL'yi koru
        if (showSlider) {
          if (sliderFiles.length > 0) {
            // Yeni slider dosyaları yükle
            sliderImageUrls = await Promise.all(
              sliderFiles.map((file) =>
                file ? uploadFileToStorage(file, `sliders`, "temp") : null
              )
            );
            sliderImageUrls = sliderImageUrls.filter((url) => url !== null);
          } else {
            // Eski slider URL'lerini koru
            sliderImageUrls = initialValues?.sliderImages || [];
          }
        } else {
          // Slider kapalıysa eski URL'leri koru
          sliderImageUrls = initialValues?.sliderImages || [];
        }

        if (showPreAudio) {
          if (preAudio) {
            // Yeni ses dosyası yükle
            preAudioUrl = await uploadFileToStorage(preAudio, `audios`, "temp");
          } else {
            // Eski ses URL'ini koru
            preAudioUrl = initialValues?.preAudio || null;
          }
        } else {
          // Ses kapalıysa eski URL'yi koru
          preAudioUrl = initialValues?.preAudio || null;
        }

        if (showPreImage) {
          if (preImage) {
            // Yeni resim dosyası yükle
            preImageUrl = await uploadFileToStorage(preImage, `images`, "temp");
          } else {
            // Eski resim URL'ini koru
            preImageUrl = initialValues?.preImage || null;
          }
        } else {
          // Resim kapalıysa eski URL'yi koru
          preImageUrl = initialValues?.preImage || null;
        }
      } else {
        // Yeni kategori modunda: dosyaları yükle
        if (showSlider && sliderFiles.length > 0) {
          sliderImageUrls = await Promise.all(
            sliderFiles.map((file) =>
              file ? uploadFileToStorage(file, `sliders`, "temp") : null
            )
          );
          sliderImageUrls = sliderImageUrls.filter((url) => url !== null);
        }
        if (showPreAudio && preAudio) {
          preAudioUrl = await uploadFileToStorage(preAudio, `audios`, "temp");
        }
        if (showPreImage && preImage) {
          preImageUrl = await uploadFileToStorage(preImage, `images`, "temp");
        }
      }

      // Kategori verilerini hazırla
      const categoryData = {
        ...data,
        durum: data.durum,
        sliderImages: sliderImageUrls,
        kategoriBaslarkenMetin: !!showPreText,
        kategoriBaslarkenSes: !!showPreAudio,
        kategoriBaslarkenResim: !!showPreImage,
        kategoriBaslarkenSlider: !!showSlider,
        kategoriBaslarkenGeriyeSayim: !!showCountdown,
        sesOtomatikOynatilsin: showPreAudio ? autoPlayAudio : false,
        preText: showPreText ? preText : null,
        preAudio: preAudioUrl,
        preImage: preImageUrl,
        countdownSeconds: showCountdown ? countdownSeconds : null,
      };

      if (onSubmitProp) {
        await onSubmitProp(categoryData, reset);
      } else {
        await addCategory(categoryData);
        toast.success("Kategori başarıyla eklendi!");
        reset(defaultValues);
      }
      setShowSlider(false);
      setSliderFiles([]);
      setSliderCount(1);
      setShowCountdown(false);
      setCountdownSeconds(3);
      setShowPreText(false);
      setPreText("");
      setShowPreAudio(false);
      setPreAudio(null);
      setShowPreImage(false);
      setPreImage(null);
      setAutoPlayAudio(false);
      setLoading(false);
    } catch (error) {
      // Backend'ten gelen hata mesajını göster
      console.error("Kategori kaydetme hatası:", error);
      const errorMessage =
        error?.message || "Kategori kaydedilirken bir hata oluştu!";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Checkboxlar en üstte, yan yana */}
        <div className="w-[750px] flex flex-row flex-wrap gap-4">
          <CustomCheckbox
            checked={showPreText}
            onChange={onPreTextCheckboxChange}
            label="Kategori başlarken metin gösterilsin"
            name="showPreText"
          />
          <CustomCheckbox
            checked={showPreAudio}
            onChange={onPreAudioCheckboxChange}
            label="Kategori başlarken ses çalsın"
            name="showPreAudio"
          />
          <CustomCheckbox
            checked={showPreImage}
            onChange={onPreImageCheckboxChange}
            label="Kategori başlarken resim gösterilsin"
            name="showPreImage"
          />
          <CustomCheckbox
            checked={showSlider}
            onChange={onSliderCheckboxChange}
            label="Kategori başlarken slider gösterilsin"
            name="showSlider"
          />
          <CustomCheckbox
            checked={showCountdown}
            onChange={onCountdownCheckboxChange}
            label="Kategori başlarken geriye sayım yapılsın"
            name="showCountdown"
          />
        </div>
        {/* Tüm form inputları ve grupları tek bir dikey blokta, eşit aralıklı */}
        <div className="flex flex-col w-[750px] gap-y-4">
          {/* Ana form alanları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Controller
              name="kategoriAdi"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Kategori Adı"
                  placeholder="Örn: Görsel Hafıza"
                  error={errors.kategoriAdi?.message}
                  delay={0.1}
                  className="w-full"
                  {...field}
                />
              )}
            />
            <Controller
              name="durum"
              control={control}
              render={({ field }) => (
                <CustomDropdown
                  label="Durum"
                  options={statusOptions}
                  error={errors.durum?.message}
                  delay={0.2}
                  className="w-full"
                  {...field}
                />
              )}
            />
            <div className="md:col-span-2">
              <Controller
                name="aciklama"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Açıklama (Opsiyonel)"
                    type="textarea"
                    placeholder="Kısa açıklama (kullanıcı görmez, en fazla 200 karakter)"
                    error={errors.aciklama?.message}
                    delay={0.3}
                    maxLength={200}
                    className="w-full"
                    {...field}
                  />
                )}
              />
            </div>
          </div>
          {/* Seçili olanların inputları formun en altında, submit üstünde */}
          {(showPreText ||
            showPreAudio ||
            showPreImage ||
            showSlider ||
            showCountdown) && (
            <div className="flex flex-col w-full gap-y-4">
              {showPreText && (
                <FormField
                  label="Kategori başlarken gösterilecek metin"
                  type="textarea"
                  value={preText}
                  onChange={(e) => setPreText(e.target.value)}
                  delay={0.1}
                  className="w-full"
                />
              )}
              {showPreAudio && (
                <div className="space-y-4">
                  {/* Mevcut ses dosyası önizlemesi */}
                  {initialValues?.preAudio && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mevcut Ses Dosyası
                      </label>
                      <audio
                        controls
                        src={`http://localhost/OkulQuiz/backend/${initialValues.preAudio}`}
                        className="w-full h-10"
                      />
                    </div>
                  )}

                  {/* Yeni ses dosyası yükleme */}
                  <div>
                    <FormField
                      label="Yeni Ses Dosyası (Değiştirmek için)"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setPreAudio(e.target.files[0])}
                      delay={0.1}
                      className="w-full"
                    />
                    <CustomCheckbox
                      checked={autoPlayAudio}
                      onChange={onAutoPlayAudioChange}
                      label="Ses otomatik oynatılsın"
                      name="autoPlayAudio"
                    />
                  </div>
                </div>
              )}
              {showPreImage && (
                <div className="space-y-4">
                  {/* Mevcut resim önizlemesi */}
                  {initialValues?.preImage && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mevcut Resim
                      </label>
                      <div className="flex justify-center">
                        <a
                          href={`http://localhost/OkulQuiz/backend/${initialValues.preImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={`http://localhost/OkulQuiz/backend/${initialValues.preImage}`}
                            alt="Kategori resmi"
                            className="w-32 h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Yeni resim yükleme */}
                  <div>
                    <FormField
                      label="Yeni Resim (Değiştirmek için)"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPreImage(e.target.files[0])}
                      delay={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              {showSlider && (
                <>
                  <FormField
                    label="Slider Resim Sayısı"
                    type="number"
                    min={1}
                    value={sliderCount}
                    onChange={onSliderCountChange}
                    delay={0.1}
                    className="w-full"
                  />
                  <div className="space-y-4">
                    {/* Mevcut slider resimleri */}
                    {initialValues?.sliderImages &&
                      initialValues.sliderImages.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Mevcut Slider Resimleri
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {initialValues.sliderImages.map((imageUrl, idx) => (
                              <a
                                key={idx}
                                href={`http://localhost/OkulQuiz/backend/${imageUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={`http://localhost/OkulQuiz/backend/${imageUrl}`}
                                  alt={`Slider Resim ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Yeni slider resimleri */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Yeni Slider Resimleri (Değiştirmek için)
                      </label>
                      {Array.from({ length: sliderCount }).map((_, idx) => (
                        <FormField
                          key={idx}
                          label={`Slider Resim ${idx + 1}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            onSliderFileChange(idx, e.target.files[0])
                          }
                          delay={0.2 + idx * 0.05}
                          className="w-full"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              {showCountdown && (
                <FormField
                  label="Kaç saniye geriye sayım yapılsın?"
                  type="number"
                  min={1}
                  value={countdownSeconds}
                  onChange={onCountdownSecondsChange}
                  delay={0.1}
                  className="w-full"
                />
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 cursor-pointer py-3 rounded-lg bg-blue-600 text-white font-semibold 
            ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700 hover:scale-105"
            } 
            transition-all duration-200`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isEdit ? "Kaydediliyor..." : "Ekleniyor..."}
              </span>
            ) : isEdit ? (
              "Kaydet"
            ) : (
              "Kategori Ekle"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KategoriFormu;
