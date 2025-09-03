import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { getCreditsPaginated } from "@/services/mysql/creditService";
import { toast } from "react-toastify";
import { FiCalendar, FiDollarSign } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import sayiFormatla from "../../../hooks/sayiFormatla";
import { tarihFormatla } from "../../../hooks/tarihFormatla";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";

const Credits = () => {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const loadingRef = useRef(null);
  const observer = useRef(null);

  // Veri yükleme fonksiyonu
  const loadMoreCredits = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getCreditsPaginated(nextPage, 6, searchTerm);

      if (result.credits.length > 0) {
        setCredits((prev) => [...prev, ...result.credits]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Krediler yüklenirken hata oluştu:", error);
      toast.error("Krediler yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchTerm]);

  // İlk yükleme ve arama işlemleri
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);

        if (!searchTerm.trim()) {
          // Arama yoksa normal pagination ile yükle
          const result = await getCreditsPaginated(1, 6);
          setCredits(result.credits);
          setCurrentPage(1);
          setHasMore(result.hasMore);
          setTotalCount(result.totalCount);
        } else {
          // Arama varsa backend'den arama sonuçlarını getir
          const result = await getCreditsPaginated(1, 6, searchTerm);
          setCredits(result.credits);
          setCurrentPage(1);
          setHasMore(result.hasMore); // Arama sonuçlarında da pagination aktif
          setTotalCount(result.totalCount);
        }
      } catch (error) {
        console.error("Krediler yüklenirken hata oluştu:", error);
        toast.error("Krediler yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    // Debounce ile arama (sadece searchTerm değiştiğinde)
    const timeoutId = setTimeout(
      () => {
        fetchCredits();
      },
      searchTerm ? 500 : 0
    ); // Arama varsa 500ms debounce, yoksa hemen çalış

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // İlk yükleme
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        const result = await getCreditsPaginated(1, 6);
        setCredits(result.credits);
        setCurrentPage(1);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error("Krediler yüklenirken hata oluştu:", error);
        toast.error("Krediler yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
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
        loadMoreCredits();
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
  }, [loading, hasMore, isLoadingMore, loadMoreCredits, searchTerm]);

  if (loading) {
    return (
      <>
        <AdminHeader title="Krediler" />
        <Loader />
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Krediler" />
      <div className="py-6 max-w-[1400px]">
        {/* Arama ve İstatistik Bölümü */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  type="text"
                  placeholder="Kredi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="search"
                  delay={0}
                />
              </div>
              <div className="flex items-center justify-end">
                <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
                  Toplam {totalCount} kredi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kredi Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {credits.map((credit) => (
              <motion.div
                key={credit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-150 p-6 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight line-clamp-2">
                      {credit.okul_adi}
                    </h3>
                    <span
                      className={`px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                        credit.kredi_miktari > 0
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {credit.kredi_miktari > 0 ? "+" : "-"}
                      {sayiFormatla(Math.abs(credit.kredi_miktari))} Kredi
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      {credit.kredi_miktari > 0 ? (
                        <IoIosAddCircleOutline className="mr-2 flex-shrink-0 text-green-500" />
                      ) : (
                        <IoIosRemoveCircleOutline className="mr-2 flex-shrink-0 text-red-500" />
                      )}
                      <span
                        className={`font-medium truncate ${
                          credit.kredi_miktari > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {credit.kredi_miktari > 0 ? "+" : "-"}
                        {sayiFormatla(Math.abs(credit.kredi_miktari))} Kredi
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-2 flex-shrink-0 text-blue-500" />
                      <span className="truncate">
                        {credit.created_at
                          ? tarihFormatla(credit.created_at)
                          : "-"}
                      </span>
                    </div>

                    {credit.aciklama && (
                      <div className="flex items-center text-gray-600">
                        <span className="truncate text-sm">
                          {credit.aciklama}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Yükleniyor ve Sonuç Bulunamadı */}
        <div className="mt-6">
          {hasMore ? (
            <div ref={loadingRef} className="py-4">
              <Loader className="h-24" />
            </div>
          ) : credits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                {searchTerm
                  ? "Arama kriterine uygun kredi bulunamadı"
                  : "Henüz kredi eklenmemiş"}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Credits;
