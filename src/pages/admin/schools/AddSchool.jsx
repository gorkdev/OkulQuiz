import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { db } from "@/services/firebase/firebase";
import { addDoc, collection } from "firebase/firestore";
import { addSchool } from "@/services/firebase/schoolService";

const AddSchool = () => {
  const [loading, setLoading] = useState(false);

  const handleAddSchool = async () => {
    try {
      setLoading(true);
      const newSchool = {
        name: "Örnek Okul",
        address: "İstanbul, Türkiye",
        email: "info@ornekokul.com",
        phone: "0555 555 55 55",
      };

      await addSchool(newSchool);
      console.log("Okul başarıyla eklendi");
    } catch (error) {
      console.error("Hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminHeader title="Yeni Okul Ekle" />

      <button onClick={handleAddSchool} disabled={loading}>
        {loading ? "Yükleniyor..." : "Okul Ekle"}
      </button>
    </>
  );
};

export default AddSchool;
