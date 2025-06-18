import React, { useState } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { addSchool } from "@/services/firebase/schoolService";
import { toast } from "react-toastify";
import FormTemplate from "@/components/FormTemplate/FormTemplate";
import FormField from "@/components/FormTemplate/FormField";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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
  okulKurulusTarihi: yup.string().required("Kuruluş tarihi zorunludur"),
});

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
  okulKurulusTarihi: "",
  okulSistemKayitTarihi: new Date().toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),
  durum: "aktif",
};

const schoolTypes = [
  { value: "devlet", label: "Devlet Okulu" },
  { value: "özel", label: "Özel Okul" },
];

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
      const schoolData = {
        ...defaultValues,
        ...data,
        okulSistemKayitTarihi: new Date().toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
      await addSchool(schoolData);
      toast.success("Okul başarıyla eklendi!");
      reset(defaultValues);
    } catch (error) {
      console.error("Hata oluştu:", error);
      toast.error("Okul eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
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
                  {...field}
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
                  label="Okul Müdürü"
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
                  label="Müdür İletişim"
                  type="tel"
                  error={errors.yetkiliTelefon?.message}
                  placeholder="0555 555 55 55"
                  delay={0.7}
                  {...field}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="okulKurulusTarihi"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Kuruluş Tarihi"
                  type="date"
                  error={errors.okulKurulusTarihi?.message}
                  delay={0.8}
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
