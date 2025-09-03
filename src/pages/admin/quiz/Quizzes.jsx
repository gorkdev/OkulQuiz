import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import {
  getQuizzesPaginated,
  updateQuiz,
  deleteQuiz,
  setQuizActive,
  setQuizPassive,
} from "@/services/mysql/quizService";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiChevronRight,
  FiX,
  FiTrash2,
  FiSave,
  FiBookOpen,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";

const Quizzes = () => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editedQuiz, setEditedQuiz] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadingRef = useRef(null);
  const observer = useRef(null);

  // Veri yükleme fonksiyonu
  const loadMoreQuizzes = useCallback(async () => {
    if (isLoadingMore || !hasMore || searchTerm.trim()) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getQuizzesPaginated(nextPage, 6);

      if (result.quizzes.length > 0) {
        setQuizzes((prev) => [...prev, ...result.quizzes]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Quizler yüklenirken hata oluştu:", error);
      toast.error("Quizler yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchTerm]);

  // İlk yükleme ve arama işlemleri
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);

        if (!searchTerm.trim()) {
          // Arama yoksa normal pagination ile yükle
          const result = await getQuizzesPaginated(1, 6);
          setQuizzes(result.quizzes);
          setCurrentPage(1);
          setHasMore(result.hasMore);
          setTotalCount(result.totalCount);
        } else {
          // Arama varsa backend'den arama sonuçlarını getir
          const result = await getQuizzesPaginated(1, 50, searchTerm);
          setQuizzes(result.quizzes);
          setCurrentPage(1);
          setHasMore(false); // Arama sonuçlarında pagination yok
          setTotalCount(result.totalCount);
        }
      } catch (error) {
        console.error("Quizler yüklenirken hata oluştu:", error);
        toast.error("Quizler yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    // Debounce ile arama (sadece searchTerm değiştiğinde)
    const timeoutId = setTimeout(
      () => {
        fetchQuizzes();
      },
      searchTerm ? 500 : 0
    ); // Arama varsa 500ms debounce, yoksa hemen çalış

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
        loadMoreQuizzes();
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
  }, [loading, hasMore, isLoadingMore, loadMoreQuizzes, searchTerm]);

  useEffect(() => {
    if (isModalOpen) {
      const original = document.body.style.overflowY;
      document.body.style.overflowY = "hidden";
      return () => {
        document.body.style.overflowY = original;
      };
    }
  }, [isModalOpen]);

  const handleOpenModal = (quiz) => {
    setSelectedQuiz(quiz);
    setEditedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedQuiz(null);
    setEditedQuiz(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setEditedQuiz((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Backend'e gönderilecek veriyi hazırla (camelCase formatında)
      const updateData = {
        quizAdi: editedQuiz.quiz_adi,
        aciklama: editedQuiz.aciklama,
        sure: editedQuiz.sure,
        durum: editedQuiz.durum,
      };

      await updateQuiz(editedQuiz.id, updateData);

      // Frontend state'ini güncelle
      setQuizzes(
        quizzes.map((quiz) => (quiz.id === editedQuiz.id ? editedQuiz : quiz))
      );
      toast.success("Quiz başarıyla güncellendi!");
      handleCloseModal();
    } catch (error) {
      console.error("Quiz güncellenirken hata oluştu:", error);
      toast.error("Quiz güncellenirken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bu quiz'i silmek istediğinizden emin misiniz?")) {
      try {
        setIsSaving(true);
        await deleteQuiz(selectedQuiz.id);
        setQuizzes(quizzes.filter((quiz) => quiz.id !== selectedQuiz.id));
        setTotalCount((prev) => prev - 1);
        toast.success("Quiz başarıyla silindi!");

        handleCloseModal();
      } catch (error) {
        console.error("Quiz silinirken hata oluştu:", error);
        toast.error("Quiz silinirken bir hata oluştu!");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSetPassive = async () => {
    try {
      setIsSaving(true);
      await setQuizPassive(editedQuiz.id);
      const updated = { ...editedQuiz, durum: "pasif" };
      setQuizzes(
        quizzes.map((quiz) => (quiz.id === editedQuiz.id ? updated : quiz))
      );
      toast.success("Quiz pasif yapıldı!");
      setEditedQuiz(updated);
    } catch (error) {
      console.error("Quiz pasif yapılırken hata oluştu:", error);
      toast.error("Quiz pasif yapılırken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async () => {
    try {
      setIsSaving(true);
      await setQuizActive(editedQuiz.id);
      const updated = { ...editedQuiz, durum: "aktif" };
      setQuizzes(
        quizzes.map((quiz) => (quiz.id === editedQuiz.id ? updated : quiz))
      );
      toast.success("Quiz aktif yapıldı!");
      setEditedQuiz(updated);
    } catch (error) {
      console.error("Quiz aktif yapılırken hata oluştu:", error);
      toast.error("Quiz aktif yapılırken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Quizler" />
        <Loader />
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Quizler" />
      <div className="py-6 max-w-[1400px]">
        {/* Arama ve İstatistik Bölümü */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  type="text"
                  placeholder="Quiz ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="search"
                  delay={0}
                />
              </div>
              <div className="flex items-center justify-end">
                <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
                  Toplam {totalCount} quiz
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-150 p-6 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight line-clamp-2">
                      {quiz.quiz_adi}
                    </h3>
                    <span className="px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 ml-2 bg-purple-50 text-purple-600">
                      {quiz.soru_sayisi || 0} Soru
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FiBookOpen className="mr-3 flex-shrink-0 text-purple-500" />
                      <span className="font-medium truncate">
                        {quiz.kategori_sayisi || 0} Kategori
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="truncate">
                        {quiz.sure
                          ? `${quiz.sure} dakika`
                          : "Süre belirtilmemiş"}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-3 flex-shrink-0 text-green-500" />
                      <span className="truncate">
                        {quiz.created_at
                          ? new Date(quiz.created_at).toLocaleDateString(
                              "tr-TR"
                            )
                          : "-"}
                      </span>
                    </div>

                    {quiz.aciklama && (
                      <div className="flex items-center text-gray-600">
                        <span className="truncate text-sm">
                          {quiz.aciklama}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                      quiz.durum === "aktif"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        quiz.durum === "aktif" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {quiz.durum === "aktif" ? "Aktif" : "Pasif"}
                  </span>

                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 inline-flex items-center text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-700"
                    onClick={() => handleOpenModal(quiz)}
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
          {hasMore && !searchTerm.trim() ? (
            <div ref={loadingRef} className="py-4">
              <Loader className="h-24" />
            </div>
          ) : quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                {searchTerm
                  ? "Arama kriterine uygun quiz bulunamadı"
                  : "Henüz quiz eklenmemiş"}
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* Quiz Details Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop with strong blur and light overlay */}
                <div
                  className="fixed inset-0 bg-black/10 backdrop-blur-[8px]"
                  onClick={handleCloseModal}
                />

                <motion.div
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.97, opacity: 0 }}
                  className="relative w-full max-w-3xl mx-auto my-10 bg-white/95 rounded-2xl shadow-2xl p-0 overflow-hidden border border-gray-200 flex flex-col"
                  style={{ boxShadow: "0 12px 48px 0 rgba(31, 38, 135, 0.18)" }}
                >
                  {/* Modern colored header with icon and more space */}
                  <div className="flex items-center gap-4 px-12 py-7 bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 text-white border-b border-purple-100">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 shadow-md">
                      <FiBookOpen size={34} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold tracking-tight leading-tight mb-1">
                        Quiz Detayları
                      </h3>
                      <div className="text-xs opacity-80">
                        ID:{" "}
                        {editedQuiz?.id
                          ? String(editedQuiz.id).slice(0, 8)
                          : ""}
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="ml-auto text-white/80 hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Kapat"
                    >
                      <FiX size={26} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 bg-white/95">
                    <FormField
                      label="Quiz Adı"
                      value={editedQuiz?.quiz_adi || ""}
                      onChange={(e) =>
                        handleInputChange("quiz_adi", e.target.value)
                      }
                    />
                    <FormField
                      label="Süre (Dakika)"
                      type="number"
                      value={editedQuiz?.sure || ""}
                      onChange={(e) =>
                        handleInputChange("sure", e.target.value)
                      }
                    />
                    <FormField
                      label="Açıklama"
                      type="textarea"
                      value={editedQuiz?.aciklama || ""}
                      onChange={(e) =>
                        handleInputChange("aciklama", e.target.value)
                      }
                      className="md:col-span-2"
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-4 px-12 pb-8 pt-6 border-t border-gray-100 bg-white/95">
                    <button
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="cursor-pointer flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                    >
                      <FiTrash2 className="mr-2" />
                      Quiz'i Sil
                    </button>
                    {editedQuiz?.durum === "aktif" ? (
                      <button
                        onClick={handleSetPassive}
                        disabled={isSaving}
                        className="cursor-pointer flex items-center px-4 py-2 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm"
                      >
                        <FiPause className="mr-2" />
                        Pasif Yap
                      </button>
                    ) : (
                      <button
                        onClick={handleSetActive}
                        disabled={isSaving}
                        className="cursor-pointer flex items-center px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
                      >
                        <FiPlay className="mr-2" />
                        Aktif Yap
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`cursor-pointer flex items-center px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-md ${
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

export default Quizzes;
