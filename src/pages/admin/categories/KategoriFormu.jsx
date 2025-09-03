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

  // Dosya yükleme yardımcı fonksiyonu - MySQL için basitleştirildi
  const uploadFileToStorage = async (file, path) => {
    if (!file) return null;
    // MySQL için dosya yükleme işlemi basitleştirildi
    // Gerçek uygulamada dosya upload API'si kullanılmalı
    return `uploads/${path}/${Date.now()}_${file.name}`;
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
      // Dosya upload işlemleri
      let sliderImageUrls = [];
      if (showSlider && sliderFiles.length > 0) {
        sliderImageUrls = await Promise.all(
          sliderFiles.map((file) =>
            file ? uploadFileToStorage(file, `sliderImages`) : null
          )
        );
      }
      let preAudioUrl = null;
      if (showPreAudio && preAudio) {
        preAudioUrl = await uploadFileToStorage(preAudio, `categoryAudios`);
      }
      let preImageUrl = null;
      if (showPreImage && preImage) {
        preImageUrl = await uploadFileToStorage(preImage, `categoryImages`);
      }
      const categoryData = {
        ...data,
        durum: data.durum,
        sliderImages: showSlider ? sliderImageUrls : [],
        kategoriBaslarkenMetin: !!showPreText,
        kategoriBaslarkenSes: !!showPreAudio,
        kategoriBaslarkenResim: !!showPreImage,
        kategoriBaslarkenSlider: !!showSlider,
        kategoriBaslarkenGeriyeSayim: !!showCountdown,
        sesOtomatikOynatilsin: showPreAudio ? autoPlayAudio : false,
        preText: showPreText ? preText : null,
        preAudio: showPreAudio ? preAudioUrl : null,
        preImage: showPreImage ? preImageUrl : null,
        countdownSeconds: showCountdown ? countdownSeconds : null,
        createdAt: new Date().toISOString(),
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
      toast.error("Kategori kaydedilirken bir hata oluştu!");
      setLoading(false);
    }
  };

  return (
    <FormTemplate
      onSubmit={handleSubmit(onSubmit)}
      submitText={isEdit ? "Kaydet" : "Kategori Ekle"}
      loadingText={isEdit ? "Kaydediliyor..." : "Ekleniyor..."}
      loading={loading}
    >
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
              <div className="flex flex-row gap-4 items-center w-full">
                {/* Ses dosyası önizlemesi - input ile yan yana, %50 %50 */}
                {initialValues && (
                  <div className="w-full flex items-center justify-center">
                    {initialValues.preAudio &&
                      typeof initialValues.preAudio === "string" && (
                        <audio
                          controls
                          src={initialValues.preAudio}
                          className="w-full h-10"
                        />
                      )}
                  </div>
                )}
                <div className="w-full">
                  <FormField
                    label="Kategori başlarken ses"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setPreAudio(e.target.files[0])}
                    delay={0.1}
                    className="w-full mb-2"
                  />
                  <div>
                    <CustomCheckbox
                      checked={autoPlayAudio}
                      onChange={onAutoPlayAudioChange}
                      label="Ses otomatik oynatılsın"
                      name="autoPlayAudio"
                    />
                  </div>
                </div>
              </div>
            )}
            {showPreImage && (
              <div className="flex items-center justify-center gap-4">
                {/* Resim önizlemesi - küçük ve yanında, tıklanınca yeni sekmede */}
                {initialValues &&
                  initialValues.preImage &&
                  typeof initialValues.preImage === "string" && (
                    <a
                      href={initialValues.preImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={initialValues.preImage}
                        alt="Kategori resmi"
                        className="w-20 h-20 rounded shadow-sm"
                      />
                    </a>
                  )}
                <div className="flex-1">
                  <FormField
                    label="Kategori başlarken resim"
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
                <div className="flex flex-col gap-y-4 w-full">
                  {Array.from({ length: sliderCount }).map((_, idx) => (
                    <div key={idx} className="flex flex-row items-center gap-4">
                      {/* Slider resmi önizlemesi inputun yanında */}
                      {initialValues &&
                        Array.isArray(initialValues.sliderImages) &&
                        initialValues.sliderImages[idx] && (
                          <a
                            href={initialValues.sliderImages[idx]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={initialValues.sliderImages[idx]}
                              alt={`Slider Resim ${idx + 1}`}
                              className="w-20 h-20 rounded shadow-sm"
                            />
                          </a>
                        )}
                      <div className="flex-1">
                        <FormField
                          label={`Slider Resim ${idx + 1}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            onSliderFileChange(idx, e.target.files[0])
                          }
                          delay={0.2 + idx * 0.05}
                          className=""
                        />
                      </div>
                    </div>
                  ))}
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
    </FormTemplate>
  );
};

export default KategoriFormu;
