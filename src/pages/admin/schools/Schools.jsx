import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import {
  getSchoolsPaginated,
  updateSchool,
  deleteSchool,
} from "@/services/firebase/schoolService";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiMail,
  FiPhone,
  FiUsers,
  FiMapPin,
  FiChevronRight,
  FiX,
  FiTrash2,
  FiSave,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import FormField from "@/components/FormTemplate/FormField";
import Loader from "@/components/Loader";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedSchool, setEditedSchool] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastDocId, setLastDocId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(null);
  const observer = useRef(null);

  // Arama fonksiyonu
  const filteredSchools = schools.filter((school) =>
    Object.values(school).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Veri yükleme fonksiyonu
  const loadMoreSchools = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const result = await getSchoolsPaginated(6, lastDocId);

      if (result.schools.length > 0) {
        setSchools((prev) => [...prev, ...result.schools]);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Okullar yüklenirken hata oluştu:", error);
      toast.error("Okullar yüklenirken bir hata oluştu!");
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastDocId, hasMore, isLoadingMore]);

  // İlk yükleme
  useEffect(() => {
    const fetchInitialSchools = async () => {
      try {
        setLoading(true);
        const result = await getSchoolsPaginated(6);
        setSchools(result.schools);
        setLastDocId(result.lastDoc);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Okullar yüklenirken hata oluştu:", error);
        toast.error("Okullar yüklenirken bir hata oluştu!");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSchools();
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

  const handleOpenModal = (school) => {
    setSelectedSchool(school);
    setEditedSchool(school);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSchool(null);
    setEditedSchool(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setEditedSchool((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSchool(editedSchool.id, editedSchool);
      setSchools(
        schools.map((school) =>
          school.id === editedSchool.id ? editedSchool : school
        )
      );
      toast.success("Okul başarıyla güncellendi!");
      handleCloseModal();
    } catch (error) {
      console.error("Okul güncellenirken hata oluştu:", error);
      toast.error("Okul güncellenirken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bu okulu silmek istediğinizden emin misiniz?")) {
      try {
        setIsSaving(true);
        await deleteSchool(selectedSchool.id);
        setSchools(schools.filter((school) => school.id !== selectedSchool.id));
        toast.success("Okul başarıyla silindi!");
        handleCloseModal();
      } catch (error) {
        console.error("Okul silinirken hata oluştu:", error);
        toast.error("Okul silinirken bir hata oluştu!");
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Okullar" />
        <Loader />
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Okullar" />
      <div className="py-6 max-w-[1400px]">
        {/* Arama ve İstatistik Bölümü */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  type="text"
                  placeholder="Okul ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Okul Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSchools.map((school) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-150 p-6 border border-gray-100 relative group hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight line-clamp-2">
                      {school.okulAdi}
                    </h3>
                    <span
                      className={`px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                        school.okulTuru === "devlet"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {school.okulTuru === "devlet" ? "Devlet" : "Özel"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="font-medium truncate">
                        {school.ogrenciSayisi} Öğrenci
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="truncate">
                        {school.il} / {school.ilce}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{school.telefon}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="truncate">{school.eposta}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="truncate">
                        {school.okulSistemKayitTarihi}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                      school.durum === "aktif"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        school.durum === "aktif" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {school.durum === "aktif" ? "Aktif" : "Pasif"}
                  </span>

                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all duration-150 inline-flex items-center text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-700"
                    onClick={() => handleOpenModal(school)}
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
          ) : filteredSchools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-lg">
                Arama kriterine uygun okul bulunamadı
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* School Details Modal */}
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
                  <div className="flex items-center gap-4 px-12 py-7 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white border-b border-blue-100">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 shadow-md">
                      <FiUsers size={34} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold tracking-tight leading-tight mb-1">
                        Okul Detayları
                      </h3>
                      <div className="text-xs opacity-80">
                        ID: {editedSchool?.id?.slice(0, 8) || ""}
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
                      label="Okul Adı"
                      value={editedSchool?.okulAdi || ""}
                      onChange={(e) =>
                        handleInputChange("okulAdi", e.target.value)
                      }
                    />
                    <CustomDropdown
                      label="Okul Türü"
                      options={[
                        { value: "devlet", label: "Devlet Okulu" },
                        { value: "özel", label: "Özel Okul" },
                      ]}
                      value={editedSchool?.okulTuru || ""}
                      onChange={(e) =>
                        handleInputChange("okulTuru", e.target.value)
                      }
                    />
                    <FormField
                      label="İl"
                      value={editedSchool?.il || ""}
                      onChange={(e) => handleInputChange("il", e.target.value)}
                    />
                    <FormField
                      label="İlçe"
                      value={editedSchool?.ilce || ""}
                      onChange={(e) =>
                        handleInputChange("ilce", e.target.value)
                      }
                    />
                    <FormField
                      label="Adres"
                      type="textarea"
                      value={editedSchool?.adres || ""}
                      onChange={(e) =>
                        handleInputChange("adres", e.target.value)
                      }
                      className="md:col-span-2"
                    />
                    <FormField
                      label="E-posta"
                      type="email"
                      value={editedSchool?.eposta || ""}
                      onChange={(e) =>
                        handleInputChange("eposta", e.target.value)
                      }
                    />
                    <FormField
                      label="Telefon"
                      type="tel"
                      value={editedSchool?.telefon || ""}
                      onChange={(e) =>
                        handleInputChange("telefon", e.target.value)
                      }
                    />
                    <FormField
                      label="Website"
                      type="url"
                      value={editedSchool?.website || ""}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                    />
                    <FormField
                      label="Öğrenci Sayısı"
                      value={editedSchool?.ogrenciSayisi || ""}
                      onChange={(e) =>
                        handleInputChange("ogrenciSayisi", e.target.value)
                      }
                    />
                    <FormField
                      label="Yetkili Kişi"
                      value={editedSchool?.gorusulecekYetkili || ""}
                      onChange={(e) =>
                        handleInputChange("gorusulecekYetkili", e.target.value)
                      }
                    />
                    <FormField
                      label="Yetkili Telefon"
                      type="tel"
                      value={editedSchool?.yetkiliTelefon || ""}
                      onChange={(e) =>
                        handleInputChange("yetkiliTelefon", e.target.value)
                      }
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
                      Okulu Sil
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

export default Schools;
