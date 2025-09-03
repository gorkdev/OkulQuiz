import React, { useEffect, useState } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import FormTemplate from "@/components/FormTemplate/FormTemplate";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import { getCategoriesPaginated } from "@/services/mysql/categoryService";
import QuestionFormTemplate from "@/components/QuestionsTemplate/QuestionFormTemplate";

// Kategori adında veya açıklamasında 'görsel' veya 'görselli' geçenler görselli, diğerleri sesli kabul edilir
function getQuestionTypeFromCategory(category) {
  const name = (category.kategori_adi || "").toLowerCase();
  const desc = (category.aciklama || "").toLowerCase();
  if (
    name.includes("görsel") ||
    name.includes("görselli") ||
    desc.includes("görsel")
  )
    return "gorselli";
  return "sesli";
}

const AddNewQuestion = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await getCategoriesPaginated(1, 50);
        setCategories(result.categories || []);
      } catch (e) {
        console.error("Kategoriler yüklenirken hata:", e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedCategory(null);
      return;
    }
    const cat = categories.find((c) => c.id === selectedCategoryId);
    setSelectedCategory(cat || null);
  }, [selectedCategoryId, categories]);

  // Soru template'leri
  const renderQuestionTemplate = () => {
    if (!selectedCategory) return null;
    return <QuestionFormTemplate selectedCategory={selectedCategory} />;
  };

  return (
    <>
      <AdminHeader title="Yeni Soru Ekle" />
      <div className="flex w-full min-h-[60vh]">
        <div className="w-full">
          {loading ? (
            <Loader />
          ) : (
            <div className="w-[750px] mt-5 mb-6">
              <CustomDropdown
                label="Kategori"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                options={categories.map((cat) => ({
                  value: cat.id,
                  label: cat.kategori_adi,
                }))}
                required
              />
            </div>
          )}
          <div className="w-[750px]">{renderQuestionTemplate()}</div>
        </div>
      </div>
    </>
  );
};

export default AddNewQuestion;
