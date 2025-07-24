import React from "react";
import FormField from "@/components/FormTemplate/FormField";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import CustomCheckbox from "@/components/FormTemplate/CustomCheckbox";

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "pasif", label: "Pasif" },
];

const KategoriDetayFormu = ({ initialValues }) => {
  if (!initialValues) return null;
  return (
    <form className="flex flex-col w-[750px] gap-y-4 pointer-events-none select-none">
      {/* Checkboxlar en üstte, yan yana */}
      <div className="w-[750px] flex flex-row flex-wrap gap-4">
        <CustomCheckbox
          defaultChecked={!!initialValues.kategoriBaslarkenMetin}
          readOnly
          label="Kategori başlarken metin gösterilsin"
          name="showPreText"
        />
        <CustomCheckbox
          defaultChecked={!!initialValues.kategoriBaslarkenSes}
          readOnly
          label="Kategori başlarken ses çalsın"
          name="showPreAudio"
        />
        <CustomCheckbox
          defaultChecked={!!initialValues.kategoriBaslarkenResim}
          readOnly
          label="Kategori başlarken resim gösterilsin"
          name="showPreImage"
        />
        <CustomCheckbox
          defaultChecked={!!initialValues.kategoriBaslarkenSlider}
          readOnly
          label="Kategori başlarken slider gösterilsin"
          name="showSlider"
        />
        <CustomCheckbox
          defaultChecked={!!initialValues.kategoriBaslarkenGeriyeSayim}
          readOnly
          label="Kategori başlarken geriye sayım yapılsın"
          name="showCountdown"
        />
      </div>
      {/* Ana form alanları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <FormField
          label="Kategori Adı"
          value={initialValues.kategoriAdi || ""}
          readOnly
          className="w-full"
        />
        <CustomDropdown
          label="Durum"
          options={statusOptions}
          value={initialValues.durum || "aktif"}
          disabled
          className="w-full"
        />
        <div className="md:col-span-2">
          <FormField
            label="Açıklama (Opsiyonel)"
            type="textarea"
            value={initialValues.aciklama || ""}
            readOnly
            className="w-full"
          />
        </div>
      </div>
      {/* Seçili olanların input değerleri */}
      {(!!initialValues.kategoriBaslarkenMetin ||
        !!initialValues.kategoriBaslarkenSes ||
        !!initialValues.kategoriBaslarkenResim ||
        !!initialValues.kategoriBaslarkenSlider ||
        !!initialValues.kategoriBaslarkenGeriyeSayim) && (
        <div className="flex flex-col w-full gap-y-4">
          {!!initialValues.kategoriBaslarkenMetin && (
            <FormField
              label="Kategori başlarken gösterilecek metin"
              type="textarea"
              value={initialValues.preText || ""}
              readOnly
              className="w-full"
            />
          )}
          {!!initialValues.kategoriBaslarkenSes && (
            <FormField
              label="Kategori başlarken ses"
              value={initialValues.preAudio ? "Yüklü ses dosyası var" : "-"}
              readOnly
              className="w-full"
            />
          )}
          {!!initialValues.kategoriBaslarkenResim && (
            <FormField
              label="Kategori başlarken resim"
              value={initialValues.preImage ? "Yüklü resim var" : "-"}
              readOnly
              className="w-full"
            />
          )}
          {!!initialValues.kategoriBaslarkenSlider && (
            <FormField
              label="Slider Resim Sayısı"
              value={
                Array.isArray(initialValues.sliderImages)
                  ? initialValues.sliderImages.length
                  : 0
              }
              readOnly
              className="w-full"
            />
          )}
          {!!initialValues.kategoriBaslarkenGeriyeSayim && (
            <FormField
              label="Kaç saniye geriye sayım yapılsın?"
              value={initialValues.countdownSeconds || "-"}
              readOnly
              className="w-full"
            />
          )}
        </div>
      )}
    </form>
  );
};

export default KategoriDetayFormu;
