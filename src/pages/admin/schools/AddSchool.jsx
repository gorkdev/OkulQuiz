import React, { useState } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { addSchool, isUsernameTaken } from "@/services/firebase/schoolService";
import { toast } from "react-toastify";
import FormTemplate from "@/components/FormTemplate/FormTemplate";
import FormField from "@/components/FormTemplate/FormField";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const generatePassword = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const schema = yup.object().shape({
  okulAdi: yup.string().required("Okul adı zorunludur"),
  okulTuru: yup.string().required("Okul türü zorunludur"),
  adres: yup.string().required("Adres zorunludur"),
  ilce: yup.string().required("İlçe zorunludur"),
  il: yup.string().required("İl zorunludur"),
  eposta: yup
    .string()
    .email("Geçerli bir e-posta adresi girin")
    .required("E-posta zorunludur"),
  telefon: yup
    .string()
    .matches(
      /^0\d{3}\s\d{3}\s\d{2}\s\d{2}$/,
      "Geçerli bir telefon numarası girin"
    )
    .required("Telefon numarası zorunludur"),
  website: yup.string().url("Geçerli bir website adresi girin").optional(),
  gorusulecekYetkili: yup.string().optional(),
  yetkiliTelefon: yup
    .string()
    .matches(
      /^0\d{3}\s\d{3}\s\d{2}\s\d{2}$/,
      "Geçerli bir telefon numarası girin"
    )
    .optional(),
  ogrenciSayisi: yup.string().required("Öğrenci sayısı zorunludur"),
  kullaniciAdi: yup.string().required("Kullanıcı adı zorunludur"),
  sifre: yup
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .required("Şifre zorunludur"),
});

const generateUsername = () => {
  return `school${Math.floor(1000 + Math.random() * 9000)}`;
};

const defaultValues = {
  okulAdi: "",
  okulTuru: "devlet",
  adres: "",
  ilce: "",
  il: "",
  eposta: "",
  telefon: "",
  website: "",
  ogrenciSayisi: "",
  gorusulecekYetkili: "",
  yetkiliTelefon: "",
  okulSistemKayitTarihi: new Date().toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }),
  durum: "aktif",
  kullaniciAdi: generateUsername(),
  sifre: generatePassword(),
};

const schoolTypes = [
  { value: "devlet", label: "Devlet Okulu" },
  { value: "özel", label: "Özel Okul" },
];

const formatPhoneNumber = (value) => {
  if (!value) return "";
  // Sadece rakamları al
  let digits = value.replace(/\D/g, "");
  // Başa 0 ekle (yoksa)
  if (!digits.startsWith("0")) {
    digits = "0" + digits;
  }
  // En fazla 11 hane
  digits = digits.slice(0, 11);

  // Parçala ve birleştir
  let formatted = digits;
  if (digits.length > 1) {
    formatted = digits.slice(0, 4);
    if (digits.length > 4) {
      formatted += " " + digits.slice(4, 7);
      if (digits.length > 7) {
        formatted += " " + digits.slice(7, 9);
        if (digits.length > 9) {
          formatted += " " + digits.slice(9, 11);
        }
      } else if (digits.length > 7) {
        formatted += " " + digits.slice(7, 9);
      }
    } else if (digits.length > 4) {
      formatted += " " + digits.slice(4, 7);
    }
  }
  return formatted.trim();
};

const AddSchool = () => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Kullanıcı adı benzersiz mi kontrol et
      const taken = await isUsernameTaken(data.kullaniciAdi);
      if (taken) {
        toast.error("Bu kullanıcı adı zaten kullanılıyor.");
        setLoading(false);
        return;
      }
      const schoolData = {
        ...defaultValues,
        ...data,
        okulSistemKayitTarihi: new Date().toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        kullaniciAdi: data.kullaniciAdi,
        sifre: data.sifre,
      };
      await addSchool(schoolData);
      toast.success("Okul başarıyla eklendi!");
      reset({
        ...defaultValues,
        kullaniciAdi: generateUsername(),
        sifre: generatePassword(),
      });
    } catch (error) {
      console.error("Hata oluştu:", error);
      toast.error("Okul eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e, field) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    field.onChange(formattedValue);
  };

  return (
    <>
      <AdminHeader title="Yeni Okul Ekle" />

      <FormTemplate
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitText="Okulu Ekle"
        loadingText="Ekleniyor..."
      >
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Controller
              name="okulAdi"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Okul Adı"
                  error={errors.okulAdi?.message}
                  placeholder="Örn: Atatürk İlkokulu"
                  delay={0.1}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="okulTuru"
              control={control}
              render={({ field }) => (
                <CustomDropdown
                  label="Okul Türü"
                  options={schoolTypes}
                  error={errors.okulTuru?.message}
                  delay={0.2}
                  {...field}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <Controller
              name="adres"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Adres"
                  type="textarea"
                  error={errors.adres?.message}
                  placeholder="Tam adres"
                  delay={0.3}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="il"
              control={control}
              render={({ field }) => (
                <FormField
                  label="İl"
                  placeholder="Örn: Ankara"
                  error={errors.il?.message}
                  delay={0.4}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="ilce"
              control={control}
              render={({ field }) => (
                <FormField
                  label="İlçe"
                  placeholder="Örn: Merkez"
                  error={errors.ilce?.message}
                  delay={0.4}
                  {...field}
                />
              )}
            />
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Controller
              name="eposta"
              control={control}
              render={({ field }) => (
                <FormField
                  label="E-posta"
                  type="email"
                  error={errors.eposta?.message}
                  placeholder="okul@example.com"
                  delay={0.5}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="telefon"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Telefon"
                  type="tel"
                  error={errors.telefon?.message}
                  placeholder="0555 555 55 55"
                  delay={0.5}
                  onChange={(e) => handlePhoneChange(e, field)}
                  value={field.value}
                  maxLength={14}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Website"
                  type="url"
                  error={errors.website?.message}
                  placeholder="https://www.example.com"
                  delay={0.6}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="ogrenciSayisi"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Öğrenci Sayısı"
                  type="text"
                  placeholder="Örn: 1000"
                  error={errors.ogrenciSayisi?.message}
                  delay={0.6}
                  {...field}
                />
              )}
            />
          </div>
        </div>

        {/* Yönetici Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Controller
              name="gorusulecekYetkili"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Yetkili Kişi"
                  placeholder="Örn: Ahmet Yılmaz"
                  error={errors.gorusulecekYetkili?.message}
                  delay={0.7}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="yetkiliTelefon"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Yetkili Telefon"
                  type="tel"
                  error={errors.yetkiliTelefon?.message}
                  placeholder="0555 555 55 55"
                  delay={0.7}
                  onChange={(e) => handlePhoneChange(e, field)}
                  value={field.value}
                  maxLength={14}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="kullaniciAdi"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Kullanıcı Adı"
                  error={errors.kullaniciAdi?.message}
                  placeholder="Kullanıcı Adı"
                  delay={0.15}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="sifre"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Şifre"
                  type="text"
                  error={errors.sifre?.message}
                  placeholder="Şifre"
                  delay={0.16}
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </FormTemplate>
    </>
  );
};

export default AddSchool;
