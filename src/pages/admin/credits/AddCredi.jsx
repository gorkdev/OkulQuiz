import React, { useState, useEffect } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import FormField from "../../../components/FormTemplate/FormField";
import {
  getSchools,
  updateSchool,
  getSchoolsPaginated,
} from "../../../services/firebase/schoolService";
import Loader from "../../../components/Loader";
import { motion } from "framer-motion";
import { addLog } from "../../../services/firebase/logService";

const AddCredi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [creditValue, setCreditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSchool, setModalSchool] = useState(null);
  const [modalInitialCredit, setModalInitialCredit] = useState("");
  const [modalCredit, setModalCredit] = useState("");
  const [newCredit, setNewCredit] = useState(null);
  const modalRef = React.useRef(null);
  const [lastDocId, setLastDocId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = React.useRef(null);
  const observer = React.useRef(null);

  const filteredSchools = schools.filter((school) => {
    const name = school.name || school.okulAdi || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const loadMoreSchools = React.useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const result = await getSchoolsPaginated(6, lastDocId);
      if (result.schools.length > 0) {
        setSchools((prev) => [...prev, ...result.schools]);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
        addLog({
          title: "Daha Fazla Okul Yüklendi",
          details: `Yeni okullar yüklendi. Eklenen: ${result.schools.length}`,
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      alert("Okullar yüklenirken hata oluştu");
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastDocId, hasMore, isLoadingMore]);

  useEffect(() => {
    const fetchInitialSchools = async () => {
      setLoading(true);
      try {
        const result = await getSchoolsPaginated(6);
        setSchools(result.schools);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
        addLog({
          title: "Okullar Yüklendi",
          details: `İlk sayfa okullar yüklendi. Toplam: ${result.schools.length}`,
        });
      } catch (err) {
        alert("Okullar yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialSchools();
  }, []);

  useEffect(() => {
    if (loading) return;
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };
    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
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
  }, [loading, hasMore, isLoadingMore, loadMoreSchools]);

  // Modal açıldığında ilk değeri ayarla
  useEffect(() => {
    if (modalOpen) {
      setModalCredit(modalInitialCredit || "");
      setNewCredit(null);
    }
  }, [modalOpen, modalInitialCredit]);

  // ESC ile kapama
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
        addLog({
          title: "Kredi Ata Modal ESC ile Kapatıldı",
          details: `${modalSchool?.name || modalSchool?.okulAdi || "Bilinmeyen"} (${modalSchool?.id || "-"}) için modal ESC ile kapatıldı.`,
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
          details: `${modalSchool?.name || modalSchool?.okulAdi || "Bilinmeyen"} (${modalSchool?.id || "-"}) için modal dışarı tıklama ile kapatıldı.`,
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
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                type="text"
                placeholder="Okul ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  addLog({
                    title: "Okul Arama Yapıldı",
                    details: `Aranan terim: ${e.target.value}`,
                  });
                }}
                icon="search"
                delay={0}
              />
            </div>
            <div className="flex items-center justify-end">
              <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-medium">
                Toplam {filteredSchools.length} okul listeleniyor
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Okul kartları */}
      <div className="space-y-4">
        {loading ? (
          <Loader className="h-24" />
        ) : filteredSchools.length === 0 ? (
          <div>Hiç okul bulunamadı.</div>
        ) : (
          filteredSchools.map((school, idx) => (
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
              className="bg-white rounded-xl transition-all duration-150 hover:shadow-lg hover:-translate-y-1 p-4 flex items-center gap-4"
            >
              <div className="flex-1 font-medium text-gray-800">
                {school.name || school.okulAdi}
              </div>
              <div className="text-blue-700 font-semibold">
                {school.kredi || 0} kredi
              </div>
              <div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer transition-transform duration-200 hover:scale-110"
                  onClick={() => {
                    setModalSchool(school);
                    setModalInitialCredit("");
                    setModalCredit("");
                    setModalOpen(true);
                    addLog({
                      title: "Kredi Ata Modal Açıldı",
                      details: `${school.name || school.okulAdi} (${school.id}) için modal açıldı.`,
                    });
                  }}
                >
                  Kredi Ata
                </button>
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
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          modalOpen ? "visible bg-black/40" : "invisible bg-transparent"
        }`}
        style={{ pointerEvents: modalOpen ? "auto" : "none" }}
      >
        <div
          ref={modalRef}
          className={`bg-white rounded-xl shadow-lg p-8 w-full max-w-md transform transition-all duration-300 ${
            modalOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            {(modalSchool?.name || modalSchool?.okulAdi) + " için Kredi Ata"}
          </h2>
          {typeof modalSchool?.kredi !== "undefined" && (
            <div className="text-center mb-4">
              <span className="inline-block text-base font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg shadow-sm">
                Mevcut Kredi: {modalSchool.kredi}
              </span>
            </div>
          )}
          <FormField
            type="number"
            label="Kredi miktarı"
            placeholder="Kredi miktarı giriniz"
            value={modalCredit}
            onChange={(e) => setModalCredit(e.target.value)}
            className="mb-2 hide-number-arrows"
            min={0}
            max={999999}
            autoFocus
          />
          <div className="flex justify-center gap-4 mb-4">
            <div className="flex flex-col justify-center items-center gap-4">
              <div className="flex flex-row justify-center items-center gap-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow transition-transform duration-150 hover:scale-110 cursor-pointer"
                  style={{ lineHeight: 1 }}
                  onClick={() => {
                    if (!modalSchool) return;
                    if (modalCredit === "" || isNaN(Number(modalCredit)))
                      return;
                    const mevcut =
                      newCredit !== null
                        ? newCredit
                        : Number(modalSchool.kredi) || 0;
                    const girilen = Number(modalCredit);
                    setNewCredit(mevcut + girilen);
                    setModalCredit("");
                    addLog({
                      title: "Kredi Eklendi (Modal)",
                      details: `${modalSchool.name || modalSchool.okulAdi} (${modalSchool.id}) için ${girilen} kredi eklendi. Yeni kredi: ${mevcut + girilen}`,
                    });
                  }}
                  type="button"
                  title="Ekle"
                >
                  <span className="flex items-center justify-center w-full h-full relative -top-1">
                    +
                  </span>
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow transition-transform duration-150 hover:scale-110 cursor-pointer"
                  style={{ lineHeight: 1 }}
                  onClick={() => {
                    if (!modalSchool) return;
                    if (modalCredit === "" || isNaN(Number(modalCredit)))
                      return;
                    const mevcut =
                      newCredit !== null
                        ? newCredit
                        : Number(modalSchool.kredi) || 0;
                    const girilen = Number(modalCredit);
                    setNewCredit(mevcut - girilen);
                    setModalCredit("");
                    addLog({
                      title: "Kredi Çıkarıldı (Modal)",
                      details: `${modalSchool.name || modalSchool.okulAdi} (${modalSchool.id}) için ${girilen} kredi çıkarıldı. Yeni kredi: ${mevcut - girilen}`,
                    });
                  }}
                  type="button"
                  title="Çıkar"
                >
                  <span className="flex items-center justify-center w-full h-full relative -top-1">
                    –
                  </span>
                </button>
              </div>
            </div>
          </div>
          {/* Yeni kredi büyük şekilde gösterilsin, sadece input boş değilse ve newCredit null değilse */}
          {modalCredit === "" && newCredit === null
            ? null
            : newCredit !== null && (
                <div className="text-center mb-4">
                  <span
                    className={`inline-block text-base font-bold px-6 py-3 rounded-lg shadow-sm ${
                      newCredit < 0
                        ? "text-red-500 bg-red-50"
                        : "text-green-700 bg-green-50"
                    }`}
                  >
                    Yeni Kredi: {newCredit}
                  </span>
                  {newCredit < 0 && (
                    <div className="text-red-500 mt-2">
                      Kredi 0'dan küçük olamaz!
                    </div>
                  )}
                </div>
              )}
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer"
              onClick={() => {
                setModalOpen(false);
                addLog({
                  title: "Kredi Ata Modal Kapatıldı",
                  details: `${modalSchool?.name || modalSchool?.okulAdi || "Bilinmeyen"} (${modalSchool?.id || "-"}) için modal kapatıldı.`,
                });
              }}
              type="button"
            >
              İptal
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
              onClick={async () => {
                if (!modalSchool) return;
                if (newCredit === null || isNaN(newCredit) || newCredit < 0)
                  return;
                setLoading(true);
                try {
                  await updateSchool(modalSchool.id, {
                    ...modalSchool,
                    kredi: newCredit,
                  });
                  setSchools((prev) =>
                    prev.map((s) =>
                      s.id === modalSchool.id ? { ...s, kredi: newCredit } : s
                    )
                  );
                  addLog({
                    title: "Okula Kredi Kaydedildi",
                    details: `${modalSchool.name || modalSchool.okulAdi} (${modalSchool.id}) için yeni kredi: ${newCredit}`,
                  });
                  setModalOpen(false);
                } catch (err) {
                  alert(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              type="button"
              disabled={newCredit === null || isNaN(newCredit) || newCredit < 0}
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
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
