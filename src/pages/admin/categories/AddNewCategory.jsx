import React, { useState } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import FormTemplate from "@/components/FormTemplate/FormTemplate";
import FormField from "@/components/FormTemplate/FormField";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
  addCategory,
  isCategoryNameTaken,
} from "@/services/firebase/categoryService";

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

const AddNewCategory = () => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const taken = await isCategoryNameTaken(data.kategoriAdi);
      if (taken) {
        toast.error("Bu kategori adı zaten kullanılıyor.");
        setLoading(false);
        return;
      }
      const categoryData = {
        ...data,
        durum: data.durum === true || data.durum === "true" ? "aktif" : "pasif",
      };
      await addCategory(categoryData);
      toast.success("Kategori başarıyla eklendi!");
      reset(defaultValues);
    } catch (error) {
      toast.error("Kategori eklenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminHeader title="Yeni Kategori Ekle" />
      <>
        <FormTemplate
          onSubmit={handleSubmit(onSubmit)}
          submitText="Kategori Ekle"
          loadingText="Ekleniyor..."
          loading={loading}
        >
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
                    placeholder="Kısa açıklama (en fazla 200 karakter)"
                    error={errors.aciklama?.message}
                    delay={0.3}
                    maxLength={200}
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        </FormTemplate>
      </>
    </>
  );
};

export default AddNewCategory;
