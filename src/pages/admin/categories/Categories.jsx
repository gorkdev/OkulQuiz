import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import {
  getAllCategoriesPaginated,
  updateCategory,
  deleteCategory,
  setCategoryActive,
  setCategoryPassive,
} from "@/services/firebase/categoryService";
import { toast } from "react-toastify";
import { FiChevronRight, FiX, FiTrash2, FiSave, FiTag } from "react-icons/fi";
import { GoCheck } from "react-icons/go";
import { CiPause1 } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "@/components/FormTemplate/FormField";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import Loader from "@/components/Loader";
import { getQuestionCountByCategoryName } from "@/services/firebase/questionService";
import KategoriFormu from "./KategoriFormu";
import KategoriDetayFormu from "./KategoriDetayFormu";

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "pasif", label: "Pasif" },
];

// Türkçe harf duyarsız karşılaştırma için yardımcı fonksiyon
function normalizeString(str) {
  return String(str)
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i");
}

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastDocId, setLastDocId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(null);
  const observer = useRef(null);
  const [categoryQuestionCounts, setCategoryQuestionCounts] = useState({});
  const [editMode, setEditMode] = useState(false);

  // Arama fonksiyonu
  const filteredCategories = categories.filter((cat) =>
    Object.values(cat).some((value) =>
      normalizeString(value).includes(normalizeString(searchTerm))
    )
  );

  // Veri yükleme fonksiyonu
  const loadMoreCategories = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const result = await getAllCategoriesPaginated(6, lastDocId);
      if (result.categories.length > 0) {
        setCategories((prev) => [...prev, ...result.categories]);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
        // Yeni yüklenen kategoriler için soru sayısı yükle
        const counts = { ...categoryQuestionCounts };
        await Promise.all(
          result.categories.map(async (cat) => {
            if (!(cat.kategoriAdi in counts)) {
              const count = await getQuestionCountByCategoryName(
                cat.kategoriAdi
              );
              counts[cat.kategoriAdi] = count;
            }
          })
        );
        setCategoryQuestionCounts(counts);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Kategoriler yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastDocId, hasMore, isLoadingMore, categoryQuestionCounts]);

  // İlk yükleme
  useEffect(() => {
    const fetchInitialCategories = async () => {
      try {
        setLoading(true);
        const result = await getAllCategoriesPaginated(6);
        setCategories(result.categories);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
        // Soru sayıları da yükleniyor
        const counts = {};
        await Promise.all(
          result.categories.map(async (cat) => {
            const count = await getQuestionCountByCategoryName(cat.kategoriAdi);
            counts[cat.kategoriAdi] = count;
          })
        );
        setCategoryQuestionCounts(counts);
      } catch (error) {
        toast.error("Kategoriler yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialCategories();
  }, []);

  // Intersection Observer kurulumu
  useEffect(() => {
    if (loading) return;
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMoreCategories();
      }
    }, options);
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, isLoadingMore, loadMoreCategories]);

  // Arama yapıldığında scroll'u sıfırla
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchTerm]);

  useEffect(() => {
    if (isModalOpen) {
      const original = document.body.style.overflowY;
      document.body.style.overflowY = "hidden";
      return () => {
        document.body.style.overflowY = original;
      };
    }
  }, [isModalOpen]);

  const handleOpenModal = (cat) => {
    setSelectedCategory(cat);
    setEditedCategory(cat);
    setIsModalOpen(true);
    setEditMode(false);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setEditedCategory(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setEditedCategory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateCategory(editedCategory.id, editedCategory);
      setCategories(
        categories.map((cat) =>
          cat.id === editedCategory.id ? editedCategory : cat
        )
      );
      toast.success("Kategori başarıyla güncellendi!");
      handleCloseModal();
    } catch (error) {
      toast.error("Kategori güncellenirken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      try {
        setIsSaving(true);
        await deleteCategory(selectedCategory.id);
        setCategories(
          categories.filter((cat) => cat.id !== selectedCategory.id)
        );
        toast.success("Kategori başarıyla silindi!");
        handleCloseModal();
      } catch (error) {
        toast.error("Kategori silinirken bir hata oluştu!");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSetPassive = async () => {
    try {
      setIsSaving(true);
      await setCategoryPassive(editedCategory.id);
      const updated = { ...editedCategory, durum: "pasif" };
      setCategories(
        categories.map((cat) => (cat.id === editedCategory.id ? updated : cat))
      );
      toast.success("Kategori pasif yapıldı!");
      setEditedCategory(updated);
    } catch (error) {
      toast.error("Kategori pasif yapılırken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async () => {
    try {
      setIsSaving(true);
      await setCategoryActive(editedCategory.id);
      const updated = { ...editedCategory, durum: "aktif" };
      setCategories(
        categories.map((cat) => (cat.id === editedCategory.id ? updated : cat))
      );
      toast.success("Kategori aktif yapıldı!");
      setEditedCategory(updated);
    } catch (error) {
      toast.error("Kategori aktif yapılırken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Kategoriler" />
        <Loader />
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Kategoriler" />
      <div className="py-6 max-w-[1400px]">
        {/* Arama ve İstatistik Bölümü */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  type="text"
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="search"
                  delay={0}
                />
              </div>
              <div className="flex items-center justify-end">
                <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
                  Toplam {filteredCategories.length} kategori listeleniyor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kategori Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCategories.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 p-3 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full min-h-[120px]"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2 flex items-center gap-2">
                      <FiTag className="text-blue-500" />
                      {cat.kategoriAdi}
                    </h3>
                    <span className="text-xs text-blue-700 font-semibold bg-blue-100 rounded px-2 py-0.5 ml-2 whitespace-nowrap">
                      {typeof categoryQuestionCounts[cat.kategoriAdi] ===
                      "number"
                        ? `${categoryQuestionCounts[cat.kategoriAdi]} soru`
                        : "..."}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cat.aciklama && (
                      <div className="flex items-center text-gray-600 text-xs">
                        <span className="truncate">{cat.aciklama}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      cat.durum === "aktif"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-1 ${
                        cat.durum === "aktif" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {cat.durum === "aktif" ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 inline-flex items-center text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-700"
                    onClick={() => handleOpenModal(cat)}
                  >
                    Detaylar
                    <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Yükleniyor ve Sonuç Bulunamadı */}
        <div className="mt-6">
          {hasMore && !searchTerm ? (
            <div ref={loadingRef} className="py-4">
              <Loader className="h-24" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                Arama kriterine uygun kategori bulunamadı
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* Category Details Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/10 backdrop-blur-[8px]"
                  onClick={handleCloseModal}
                />
                <motion.div
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.97, opacity: 0 }}
                  className="relative w-full max-w-4xl mx-auto my-10 bg-white/95 rounded-2xl shadow-2xl p-0 overflow-hidden border border-gray-200 flex flex-col"
                  style={{ boxShadow: "0 12px 48px 0 rgba(31, 38, 135, 0.18)" }}
                >
                  {/* Modal Header */}
                  <div className="flex items-center gap-4 px-12 py-8 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white border-b border-blue-100">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 shadow-md">
                      <FiTag size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold tracking-tight leading-tight mb-1">
                        Kategori Detayları
                      </h3>
                      <div className="text-xs opacity-80">
                        ID: {editedCategory?.id?.slice(0, 8) || ""}
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="ml-auto text-white/80 hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Kapat"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  {/* Modal Content */}
                  <div className="px-12 py-10 grid grid-cols-1 gap-x-10 gap-y-7 bg-white/95 justify-center">
                    <div className="mx-auto">
                      {isModalOpen && !isSaving && !editMode && (
                        <>
                          <KategoriDetayFormu initialValues={editedCategory} />
                          <div className="flex justify-end mt-6">
                            <button
                              onClick={() => setEditMode(true)}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                            >
                              Düzenle
                            </button>
                          </div>
                        </>
                      )}
                      {isModalOpen && editMode && (
                        <KategoriFormu
                          initialValues={editedCategory}
                          isEdit={true}
                          onSubmit={async (updatedData, reset) => {
                            setIsSaving(true);
                            await updateCategory(
                              editedCategory.id,
                              updatedData
                            );
                            setCategories(
                              categories.map((cat) =>
                                cat.id === editedCategory.id
                                  ? { ...editedCategory, ...updatedData }
                                  : cat
                              )
                            );
                            toast.success("Kategori başarıyla güncellendi!");
                            handleCloseModal();
                            setIsSaving(false);
                            setEditMode(false);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {/* Modal Footer */}
                  <div className="flex justify-end gap-4 px-8 pb-8 pt-6 border-t border-gray-100 bg-white/95">
                    <button
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="cursor-pointer flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                    >
                      <FiTrash2 className="mr-2" />
                      Kategoriyi Sil
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`cursor-pointer flex items-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md ${
                        isSaving ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <FiSave className="mr-2" />
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Categories;
