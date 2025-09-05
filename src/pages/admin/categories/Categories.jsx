import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiTag } from "react-icons/fi";
import {
  getAllCategoriesPaginated,
  updateCategory,
  getQuestionCountByCategoryId,
} from "@/services/mysql/categoryService";
import KategoriFormu from "./KategoriFormu";
import { toast } from "react-toastify";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import { tarihFormatla } from "../../../hooks/tarihFormatla";
import sayiFormatla from "../../../hooks/sayiFormatla";

const PAGE_SIZE = 12;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const loadingRef = useRef(null);
  const observer = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({});

  const mapCategoryToForm = useCallback((cat) => {
    if (!cat) return null;
    return {
      id: cat.id,
      kategoriAdi: cat.kategoriAdi || cat.kategori_adi || "",
      aciklama: cat.aciklama || "",
      durum: cat.durum || "aktif",
      createdAt: cat.createdAt || cat.created_at || null,
      // Yeni alanlar
      kategoriBaslarkenMetin: cat.kategori_baslarken_metin || false,
      kategoriBaslarkenSes: cat.kategori_baslarken_ses || false,
      kategoriBaslarkenResim: cat.kategori_baslarken_resim || false,
      kategoriBaslarkenSlider: cat.kategori_baslarken_slider || false,
      kategoriBaslarkenGeriyeSayim:
        cat.kategori_baslarken_geriye_sayim || false,
      sesOtomatikOynatilsin: cat.ses_otomatik_oynatilsin || false,
      preText: cat.pre_text || "",
      preAudio: cat.pre_audio_url || null,
      preImage: cat.pre_image_url || null,
      sliderImages: cat.slider_images ? JSON.parse(cat.slider_images) : [],
      countdownSeconds: cat.countdown_seconds || 3,
    };
  }, []);

  const getCategoryName = (cat) =>
    (cat && (cat.kategoriAdi || cat.kategori_adi)) || "(İsimsiz)";
  const getCreatedAt = (cat) =>
    (cat && (cat.createdAt || cat.created_at)) || null;

  const extractPaged = (res) => {
    const data = res?.data || res;
    return {
      categories: data?.categories || [],
      hasMore: data?.pagination?.has_more || false,
      totalCount: data?.pagination?.total_count || 0,
    };
  };

  const fetchCategories = useCallback(
    async (search = searchTerm) => {
      try {
        setLoading(true);
        if (!search.trim()) {
          const result = await getAllCategoriesPaginated(1, PAGE_SIZE);
          const { categories, hasMore, totalCount } = extractPaged(result);
          setCategories(categories);
          setCurrentPage(1);
          setHasMore(hasMore);
          setTotalCount(totalCount);
          // Soru sayıları
          fetchQuestionCounts(categories);
        } else {
          const result = await getAllCategoriesPaginated(1, 50, search);
          const { categories, totalCount } = extractPaged(result);
          setCategories(categories);
          setCurrentPage(1);
          setHasMore(false);
          setTotalCount(totalCount);
          fetchQuestionCounts(categories);
        }
      } catch (error) {
        toast.error("Kategoriler yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || searchTerm.trim()) return;
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getAllCategoriesPaginated(nextPage, PAGE_SIZE);
      const { categories, hasMore: more } = extractPaged(result);
      if (categories.length > 0) {
        setCategories((prev) => [...prev, ...categories]);
        setCurrentPage(nextPage);
        setHasMore(more);
        fetchQuestionCounts(categories);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Kategoriler yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchTerm]);

  const fetchQuestionCounts = useCallback(async (cats) => {
    try {
      const entries = await Promise.all(
        (cats || []).map(async (c) => {
          const cid = c.id;
          if (!cid) return [c.id, 0];
          const count = await getQuestionCountByCategoryId(cid);
          return [c.id, Number(count) || 0];
        })
      );
      setQuestionCounts((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    } catch {}
  }, []);

  useEffect(() => {
    if (loading) return;
    const options = { root: null, rootMargin: "20px", threshold: 0.1 };
    observer.current = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !isLoadingMore &&
        !searchTerm.trim()
      ) {
        loadMore();
      }
    }, options);
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore, isLoadingMore, loadMore, searchTerm]);

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleUpdate = async (data) => {
    if (!selectedCategory?.id) return;
    try {
      await updateCategory(selectedCategory.id, data);
      toast.success("Kategori başarıyla güncellendi!");

      // Güncelleme sonrası yeni verileri çek
      await fetchCategories();

      handleModalClose();
    } catch (error) {
      // Backend'ten gelen hata mesajını göster
      console.error("Güncelleme hatası:", error);
      const errorMessage =
        error?.message || "Güncelleme sırasında bir hata oluştu";
      toast.error(errorMessage);

      // Hata sonrası modal'ı kapat
      handleModalClose();
    }
  };

  const gridItems = useMemo(() => categories || [], [categories]);

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
        {/* Arama ve sayaç */}
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
                  Toplam {totalCount} kategori
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {gridItems.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 p-4 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2">
                    {getCategoryName(cat)}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      cat.durum === "aktif"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {cat.durum === "aktif" ? "Aktif" : "Pasif"}
                  </span>
                </div>
                {cat.aciklama && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {cat.aciklama}
                  </p>
                )}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-500 bg-gray-50">
                      {getCreatedAt(cat)
                        ? tarihFormatla(getCreatedAt(cat))
                        : ""}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-50">
                      {sayiFormatla(questionCounts[cat.id] ?? 0)} Soru
                    </span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 inline-flex items-center text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-700"
                    onClick={() => handleCardClick(cat)}
                  >
                    Detay
                    <FiChevronRight className="ml-1" size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Yükleniyor/Hepsi yüklendi */}
        <div className="mt-6">
          {hasMore && !searchTerm.trim() ? (
            <div ref={loadingRef} className="py-4">
              <Loader className="h-24" />
            </div>
          ) : gridItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                {searchTerm
                  ? "Arama sonucu bulunamadı"
                  : "Henüz kategori eklenmemiş"}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div
                className="fixed inset-0 bg-black/10 backdrop-blur-[8px]"
                onClick={handleModalClose}
              />
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                className="relative w-full max-w-[800px] mx-auto my-10 bg-white rounded-2xl p-0 overflow-hidden border border-gray-200 flex flex-col"
              >
                <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white border-b border-blue-100">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 shadow-md">
                    <FiTag size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight leading-tight mb-1">
                      Kategori Düzenle
                    </h3>
                    <div className="text-xs opacity-80">
                      {getCategoryName(selectedCategory)}
                    </div>
                  </div>
                  <button
                    onClick={handleModalClose}
                    className="ml-auto text-white/80 hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Kapat"
                  >
                    ✕
                  </button>
                </div>
                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto bg-white">
                  <KategoriFormu
                    initialValues={mapCategoryToForm(selectedCategory)}
                    isEdit
                    onSubmit={handleUpdate}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Categories;
