import React, { useState } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import KategoriFormu from "./KategoriFormu";

const AddNewCategory = () => {
  return (
    <>
      <AdminHeader title="Yeni Kategori Ekle" />
      <KategoriFormu />
    </>
  );
};

export default AddNewCategory;
