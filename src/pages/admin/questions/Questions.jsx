import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { getQuestionsPaginated } from "@/services/mysql/questionService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import { FiTag } from "react-icons/fi";
import { LiaQuestionSolid } from "react-icons/lia";

const difficultyColors = {
  easy: "bg-green-50 text-green-600 border-green-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  hard: "bg-red-50 text-red-600 border-red-200",
};
const difficultyLabels = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDocId, setLastDocId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(null);
  const observer = useRef(null);

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
      const nextPage = lastDocId ? lastDocId + 1 : 2;
      const result = await getQuestionsPaginated(nextPage, 6);
      if (result.questions.length > 0) {
        setQuestions((prev) => [...prev, ...result.questions]);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Sorular yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastDocId, hasMore, isLoadingMore, searchTerm]);

  // İlk yükleme ve arama işlemleri
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);

        if (!searchTerm.trim()) {
          // Arama yoksa normal pagination ile yükle
          const result = await getQuestionsPaginated(1, 6);
          setQuestions(result.questions);
          setLastDocId(result.lastDoc);
          setHasMore(result.hasMore);
        } else {
          // Arama varsa backend'den arama sonuçlarını getir
          const result = await getQuestionsPaginated(1, 50, searchTerm);
          setQuestions(result.questions);
          setLastDocId(result.lastDoc);
          setHasMore(false); // Arama sonuçlarında pagination yok
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
                  Toplam {questions.length} soru
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Soru Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {questions.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 p-3 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full min-h-[120px]"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2 flex items-center gap-2">
                      <LiaQuestionSolid className="text-blue-500" />
                      {q.kategori?.kategori_adi || "-"}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 text-xs">
                      <span className="truncate">
                        {q.soru_metni_var && q.soru_metni
                          ? q.soru_metni
                          : "Soru metni yok.."}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      difficultyColors[q.zorluk] ||
                      "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          q.zorluk === "easy"
                            ? "#22c55e"
                            : q.zorluk === "medium"
                            ? "#eab308"
                            : q.zorluk === "hard"
                            ? "#ef4444"
                            : "#6b7280",
                      }}
                    ></span>
                    {difficultyLabels[q.zorluk] || "-"}
                  </span>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600">
                      {q.puan ? `${q.puan} puan` : "-"}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600">
                      {q.sure ? `${q.sure} sn` : "-"}
                    </span>
                  </div>
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
    </>
  );
};

export default Questions;
