import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import FormField from "../../../components/FormTemplate/FormField";
import {
  getSchoolsPaginated,
  updateSchool,
} from "../../../services/mysql/schoolService";
import { addCreditToSchool } from "../../../services/mysql/creditService";
import Loader from "../../../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { addLog } from "../../../services/mysql/logService";
import {
  FiUsers,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiPlus,
  FiMinus,
  FiSave,
  FiX,
  FiHome,
  FiDollarSign,
} from "react-icons/fi";
import { sayiFormatla } from "../../../hooks/sayiFormatla";
import { toast } from "react-toastify";

const AddCredi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSchool, setModalSchool] = useState(null);
  const [modalCredit, setModalCredit] = useState("");
  const [newCredit, setNewCredit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const modalRef = useRef(null);
  const loadingRef = useRef(null);
  const observer = useRef(null);

  // Arama input değişikliği için callback
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Arama fonksiyonu
  const fetchSchools = useCallback(async (search = searchTerm) => {
    try {
      setLoading(true);

      if (!search.trim()) {
        // Arama yoksa normal pagination ile yükle
        const result = await getSchoolsPaginated(1, 6);
        setSchools(result.schools);
        setCurrentPage(1);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } else {
        // Arama varsa backend'den arama sonuçlarını getir
        const result = await getSchoolsPaginated(1, 50, search);
        setSchools(result.schools);
        setCurrentPage(1);
        setHasMore(false); // Arama sonuçlarında pagination yok
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      console.error("Okullar yüklenirken hata oluştu:", error);
      const errorMessage =
        error.message || "Okullar yüklenirken bir hata oluştu!";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Enter'a basıldığında arama yap
  const handleSearchSubmit = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        fetchSchools(searchTerm);
      }
    },
    [searchTerm, fetchSchools]
  );

  // İlk yükleme
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Otomatik arama kaldırıldı - sadece Enter'a basıldığında arama yapılacak

  // Veri yükleme fonksiyonu
  const loadMoreSchools = useCallback(async () => {
    if (isLoadingMore || !hasMore || searchTerm.trim()) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const result = await getSchoolsPaginated(nextPage, 6);

      if (result.schools.length > 0) {
        setSchools((prev) => [...prev, ...result.schools]);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Okullar yüklenirken hata oluştu:", error);
      const errorMessage =
        error.message || "Okullar yüklenirken bir hata oluştu!";
      alert(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchTerm]);

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
        loadMoreSchools();
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
  }, [loading, hasMore, isLoadingMore, loadMoreSchools, searchTerm]);

  // Modal açıldığında ilk değeri ayarla
  useEffect(() => {
    if (modalOpen) {
      console.log("Modal açıldı - modalCredit sıfırlanıyor");
      setModalCredit("");
      setNewCredit(null);
    }
  }, [modalOpen]);

  // ESC ile kapama
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
        addLog({
          title: "Kredi Ata Modal ESC ile Kapatıldı",
          details: `${modalSchool?.okul_adi || "Bilinmeyen"} (${
            modalSchool?.id || "-"
          }) için modal ESC ile kapatıldı.`,
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, modalSchool]);

  // Dışarı tıklayınca kapama
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        modalOpen
      ) {
        setModalOpen(false);
        addLog({
          title: "Kredi Ata Modal Dışarı Tıklama ile Kapatıldı",
          details: `${modalSchool?.okul_adi || "Bilinmeyen"} (${
            modalSchool?.id || "-"
          }) için modal dışarı tıklama ile kapatıldı.`,
        });
      }
    };
    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen, modalSchool]);

  return (
    <div>
      <AdminHeader title="Kredi Ekle" />

      {/* Arama ve İstatistik Bölümü */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                type="text"
                placeholder="Okul ara... (Enter'a basın)"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                icon="search"
                delay={0}
              />
            </div>
            <div className="flex items-center justify-end">
              <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
                Toplam {totalCount} okul
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Okul kartları */}
      <div className="space-y-4">
        {loading ? (
          <Loader className="h-24" />
        ) : schools.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg">
              {searchTerm
                ? "Arama kriterine uygun okul bulunamadı"
                : "Henüz okul eklenmemiş"}
            </div>
          </div>
        ) : (
          schools.map((school, idx) => (
            <motion.div
              key={school.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: idx * 0.07,
                duration: 0.45,
                type: "spring",
                stiffness: 60,
              }}
              className="bg-white rounded-xl transition-all duration-150 hover:shadow-lg hover:-translate-y-1 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {school.okul_adi}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiUsers className="mr-2 flex-shrink-0 text-blue-500" />
                      <span>{school.ogrenci_sayisi} Öğrenci</span>
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 flex-shrink-0 text-blue-500" />
                      <span>
                        {school.il} / {school.ilce}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="mr-2 flex-shrink-0 text-blue-500" />
                      <span>{school.telefon}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMail className="mr-2 flex-shrink-0 text-blue-500" />
                      <span>{school.eposta}</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 flex-shrink-0 text-blue-500" />
                      <span>{school.okul_sistem_kayit_tarihi}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-blue-700 font-semibold text-lg">
                    {sayiFormatla(school.kredi || 0)} kredi
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => {
                      setModalSchool(school);
                      setModalOpen(true);
                      addLog({
                        title: "Kredi Ata Modal Açıldı",
                        details: `${school.okul_adi} (${school.id}) için modal açıldı.`,
                      });
                    }}
                  >
                    Kredi Ata
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Infinite scroll loader */}
        {hasMore && !searchTerm && !loading && (
          <div ref={loadingRef} className="py-4">
            <Loader className="h-24" />
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Kredi Ata</h2>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-blue-100">
                  <span className="text-sm font-medium">
                    {modalSchool?.okul_adi}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sol Taraf - Kredi Bilgileri */}
                  <div>
                    {/* Mevcut Kredi */}
                    {typeof modalSchool?.kredi !== "undefined" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-6"
                      >
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-200">
                          <span className="font-semibold">
                            Mevcut: {sayiFormatla(modalSchool.kredi || 0)} kredi
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Kredi Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kredi Miktarı
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={modalCredit}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Sadece tam sayıları kabul et
                            if (value === "" || /^\d+$/.test(value)) {
                              setModalCredit(value);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Sadece sayı, backspace, delete, arrow keys ve tab'e izin ver
                            if (
                              !/[\d\b\-\t]/.test(e.key) &&
                              ![
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                                "Tab",
                              ].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 hide-number-arrows text-center text-lg font-medium"
                          min={0}
                          max={999999}
                          step={1}
                          autoFocus
                        />
                      </div>
                    </motion.div>

                    {/* Kredi Butonları */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center gap-4 mb-6"
                    >
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer"
                        onClick={() => {
                          if (!modalSchool) return;
                          if (modalCredit === "" || isNaN(Number(modalCredit)))
                            return;
                          // Ondalıklı sayı kontrolü
                          if (!Number.isInteger(Number(modalCredit))) return;
                          const mevcut = Number(modalSchool.kredi) || 0;
                          const girilen = Number(modalCredit);
                          setNewCredit(mevcut - girilen);
                          addLog({
                            title: "Kredi Çıkarıldı (Modal)",
                            details: `${modalSchool.okul_adi} (${
                              modalSchool.id
                            }) için ${girilen} kredi çıkarıldı. Yeni kredi: ${
                              mevcut - girilen
                            }`,
                          });
                        }}
                        type="button"
                        title="Çıkar"
                      >
                        <FiMinus />
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer"
                        onClick={() => {
                          if (!modalSchool) return;
                          if (modalCredit === "" || isNaN(Number(modalCredit)))
                            return;
                          // Ondalıklı sayı kontrolü
                          if (!Number.isInteger(Number(modalCredit))) return;
                          const mevcut = Number(modalSchool.kredi) || 0;
                          const girilen = Number(modalCredit);
                          setNewCredit(mevcut + girilen);
                          addLog({
                            title: "Kredi Eklendi (Modal)",
                            details: `${modalSchool.okul_adi} (${
                              modalSchool.id
                            }) için ${girilen} kredi eklendi. Yeni kredi: ${
                              mevcut + girilen
                            }`,
                          });
                        }}
                        type="button"
                        title="Ekle"
                      >
                        <FiPlus />
                      </button>
                    </motion.div>
                  </div>

                  {/* Sağ Taraf - Yeni Kredi Gösterimi ve Butonlar */}
                  <div className="flex flex-col justify-between">
                    {/* Yeni Kredi Gösterimi */}
                    <AnimatePresence>
                      {modalCredit !== "" && newCredit !== null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-center mb-6 overflow-hidden"
                        >
                          <div
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 ${
                              newCredit < 0
                                ? "text-red-600 bg-red-50 border-red-200"
                                : "text-green-600 bg-green-50 border-green-200"
                            }`}
                          >
                            <span className="font-semibold">
                              Yeni Kredi: {sayiFormatla(newCredit)}
                            </span>
                          </div>
                          {newCredit < 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-red-500 mt-3 text-sm font-medium"
                            >
                              ⚠️ Kredi 0'dan küçük olamaz!
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Modal Footer */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex gap-3"
                    >
                      <button
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md cursor-pointer"
                        onClick={() => {
                          setModalOpen(false);
                          addLog({
                            title: "Kredi Ata Modal Kapatıldı",
                            details: `${
                              modalSchool?.okul_adi || "Bilinmeyen"
                            } (${
                              modalSchool?.id || "-"
                            }) için modal kapatıldı.`,
                          });
                        }}
                        type="button"
                      >
                        <FiX className="inline mr-2" />
                        İptal
                      </button>
                      <button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        onClick={async () => {
                          if (!modalSchool) return;
                          if (!modalCredit) return;
                          if (isNaN(Number(modalCredit))) return;
                          if (Number(modalCredit) <= 0) return;
                          // Ondalıklı sayı kontrolü
                          if (!Number.isInteger(Number(modalCredit))) return;
                          if (newCredit === null) return;
                          if (newCredit < 0) return;

                          setLoading(true);
                          try {
                            const currentCredit = Number(
                              modalSchool.kredi || 0
                            );
                            // newCredit zaten hesaplanmış durumda, sadece farkı al
                            const creditDifference = newCredit - currentCredit;

                            const result = await addCreditToSchool(
                              modalSchool.id,
                              creditDifference
                            );

                            setSchools((prev) =>
                              prev.map((s) =>
                                s.id === modalSchool.id
                                  ? { ...s, kredi: newCredit }
                                  : s
                              )
                            );

                            const actionText =
                              creditDifference > 0 ? "eklendi" : "çıkarıldı";
                            const actionAmount = Math.abs(creditDifference);

                            addLog({
                              title: "Okula Kredi Kaydedildi",
                              details: `${modalSchool.okul_adi} (${modalSchool.id}) için ${actionAmount} kredi ${actionText}. Yeni kredi: ${newCredit}`,
                            });

                            toast.success(
                              `${modalSchool.okul_adi} için ${sayiFormatla(
                                actionAmount
                              )} kredi başarıyla ${actionText}!`
                            );

                            setModalOpen(false);
                            setModalCredit("");
                            setNewCredit(null);
                          } catch (err) {
                            alert(err.message);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        type="button"
                        disabled={
                          loading || (newCredit !== null && newCredit < 0)
                        }
                      >
                        {loading ? (
                          <Loader className="h-5 w-5 text-white" />
                        ) : (
                          <>
                            <FiSave className="inline mr-2" />
                            Kaydet
                          </>
                        )}
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        input[type="number"].hide-number-arrows::-webkit-inner-spin-button,
        input[type="number"].hide-number-arrows::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"].hide-number-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default AddCredi;
