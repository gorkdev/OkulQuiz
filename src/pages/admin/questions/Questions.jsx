import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { getQuestionsPaginated } from "@/services/firebase/questionService";
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
  function normalizeString(str) {
    return String(str)
      .toLocaleLowerCase("tr-TR")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i");
  }

  // Arama fonksiyonu (Categories ile aynı mantık, array ve görünen değer desteğiyle)
  function flattenValues(obj) {
    let vals = [];
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          vals = vals.concat(flattenValues(item));
        } else {
          vals.push(item);
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const value of Object.values(obj)) {
        if (typeof value === "object" && value !== null) {
          vals = vals.concat(flattenValues(value));
        } else {
          vals.push(value);
        }
      }
      // Ekstra: Görünen değerleri de ekle
      if (obj.zorluk && difficultyLabels[obj.zorluk]) {
        vals.push(difficultyLabels[obj.zorluk]); // Kolay/Orta/Zor
      }
      if (obj.puan) {
        vals.push(`${obj.puan} puan`);
      }
      if (obj.sure) {
        vals.push(`${obj.sure} sn`);
      }
      if (obj.kategori && obj.kategori.kategoriAdi) {
        vals.push(obj.kategori.kategoriAdi);
      }
    } else {
      vals.push(obj);
    }
    return vals;
  }

  const filteredQuestions = questions.filter((q) =>
    flattenValues(q).some((value) =>
      normalizeString(value).includes(normalizeString(searchTerm))
    )
  );

  // Veri yükleme fonksiyonu
  const loadMoreQuestions = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const result = await getQuestionsPaginated(6, lastDocId);
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
  }, [lastDocId, hasMore, isLoadingMore]);

  // İlk yükleme
  useEffect(() => {
    const fetchInitialQuestions = async () => {
      try {
        setLoading(true);
        const result = await getQuestionsPaginated(6);
        setQuestions(result.questions);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        toast.error("Sorular yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialQuestions();
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
  }, [loading, hasMore, isLoadingMore, loadMoreQuestions]);

  // Arama yapıldığında scroll'u sıfırla
  useEffect(() => {
    window.scrollTo(0, 0);
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
                  Toplam {filteredQuestions.length} soru listeleniyor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Soru Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredQuestions.map((q) => (
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
                      {q.kategori?.kategoriAdi || "-"}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 text-xs">
                      <span className="truncate">
                        {q.soruMetniVar && q.soruMetni
                          ? q.soruMetni
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
          {hasMore && !searchTerm ? (
            <div ref={loadingRef} className="py-4">
              <Loader className="h-24" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                Arama kriterine uygun soru bulunamadı
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Questions;
