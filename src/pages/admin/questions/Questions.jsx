import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import {
  getQuestionsPaginated,
  deleteQuestion,
} from "@/services/mysql/questionService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import { FiTag, FiChevronRight } from "react-icons/fi";
import { LiaQuestionSolid } from "react-icons/lia";

const difficultyColors = {
  kolay: "bg-green-50 text-green-600 border-green-200",
  orta: "bg-yellow-50 text-yellow-700 border-yellow-200",
  zor: "bg-red-50 text-red-600 border-red-200",
};
const difficultyLabels = {
  kolay: "Kolay",
  orta: "Orta",
  zor: "Zor",
};

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(null);
  const observer = useRef(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Türkçe harf duyarsız karşılaştırma için yardımcı fonksiyon
  const normalizeString = (str) => {
    return String(str)
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i");
  };

  // Veri yükleme fonksiyonu
  const loadMoreQuestions = useCallback(async () => {
    if (isLoadingMore || !hasMore || searchTerm.trim()) return;
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getQuestionsPaginated(nextPage, 6);
      if (result.questions.length > 0) {
        setQuestions((prev) => [...prev, ...result.questions]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Sorular yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchTerm]);

  // İlk yükleme ve arama işlemleri
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);

        if (!searchTerm.trim()) {
          // Arama yoksa normal pagination ile yükle
          const result = await getQuestionsPaginated(1, 6);
          setQuestions(result.questions || []);
          setCurrentPage(1);
          setHasMore(result.hasMore);
          setTotalCount(result.totalCount || 0);
        } else {
          // Arama varsa backend'den arama sonuçlarını getir
          const result = await getQuestionsPaginated(1, 50, searchTerm);
          setQuestions(result.questions || []);
          setCurrentPage(1);
          setHasMore(false); // Arama sonuçlarında pagination yok
          setTotalCount(result.questions?.length || 0);
        }
      } catch (error) {
        toast.error("Sorular yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    // Debounce ile arama
    const timeoutId = setTimeout(
      () => {
        fetchQuestions();
      },
      searchTerm ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Intersection Observer kurulumu
  useEffect(() => {
    if (loading) return;
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };
    observer.current = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !isLoadingMore &&
        !searchTerm.trim()
      ) {
        loadMoreQuestions();
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
  }, [loading, hasMore, isLoadingMore, loadMoreQuestions, searchTerm]);

  // Arama yapıldığında scroll'u sıfırla
  useEffect(() => {
    if (searchTerm) {
      window.scrollTo(0, 0);
    }
  }, [searchTerm]);

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteQuestion(questionToDelete.id);
      toast.success("Soru başarıyla silindi!");

      // Silinen soruyu listeden kaldır
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
      setTotalCount((prev) => prev - 1);

      // Modal'ı kapat
      setShowDeleteModal(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Silme hatası:", error);
      const errorMessage = error?.message || "Soru silinirken bir hata oluştu";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Sorular" />
        <Loader />
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Sorular" />
      <div className="py-6 max-w-[1400px]">
        {/* Arama ve İstatistik Bölümü */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  type="text"
                  placeholder="Soru ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="search"
                  delay={0}
                />
              </div>
              <div className="flex items-center justify-end">
                <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
                  Toplam {totalCount} soru
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Soru Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {questions.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 p-4 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2 flex items-center gap-2">
                    {q.kategori_adi || "-"}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      difficultyColors[q.zorluk] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {difficultyLabels[q.zorluk] || "-"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {q.soru_metni || q.soruMetni || "Soru metni yok.."}
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-500 bg-gray-50">
                      {(q.puan ?? q.puan_degeri) || 0} Puan
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-50">
                      {(q.sure ?? q.sure_saniye) || 0} Saniye
                    </span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 inline-flex items-center text-xs font-medium cursor-pointer text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(q);
                    }}
                  >
                    Sil
                    <FiChevronRight className="ml-1" size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Yükleniyor ve Sonuç Bulunamadı */}
        <div className="mt-6">
          {hasMore && !searchTerm.trim() ? (
            <div ref={loadingRef} className="py-4">
              <Loader className="h-24" />
            </div>
          ) : questions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                {searchTerm
                  ? "Arama kriterine uygun soru bulunamadı"
                  : "Henüz soru eklenmemiş"}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Silme Onay Modal'ı */}
      <AnimatePresence>
        {showDeleteModal && questionToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={handleDeleteCancel}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md mx-auto my-10 bg-white rounded-2xl p-0 overflow-hidden border border-gray-200 flex flex-col"
              >
                <div className="flex items-center gap-4 px-6 py-5 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white border-b border-red-100">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 shadow-md">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold tracking-tight leading-tight mb-1">
                      Soruyu Sil
                    </h3>
                    <div className="text-sm opacity-90">
                      Bu işlem geri alınamaz
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteCancel}
                    className="ml-auto text-white/80 hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Kapat"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 py-6 bg-white">
                  <div className="text-center">
                    <div className="text-gray-600 mb-4">
                      <strong>
                        "{questionToDelete.soru_metni?.substring(0, 100)}..."
                      </strong>{" "}
                      sorusunu silmek istediğinizden emin misiniz?
                    </div>
                    <div className="text-sm text-gray-500 mb-6">
                      Bu soruya ait tüm dosyalar (resimler, sesler) kalıcı
                      olarak silinecektir.
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleDeleteCancel}
                        disabled={isDeleting}
                        className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        {isDeleting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Siliniyor...
                          </>
                        ) : (
                          "Evet, Sil"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Questions;
