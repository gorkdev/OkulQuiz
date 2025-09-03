import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import {
  getSchoolsPaginated,
  updateSchool,
  deleteSchool,
  setSchoolPassive,
  setSchoolActive,
} from "@/services/mysql/schoolService";
import { getCreditBySchoolName } from "@/services/mysql/creditService";
import { tarihFormatla } from "@/hooks/tarihFormatla";
import { toast } from "react-toastify";
import {
  FiX,
  FiTrash2,
  FiSave,
  FiUsers,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/Loader";
import CustomDropdown from "@/components/FormTemplate/CustomDropdown";
import FormField from "@/components/FormTemplate/FormField";
import { CiPause1 } from "react-icons/ci";
import { GoCheck } from "react-icons/go";
import { SchoolsList } from "@/components/SchoolsList";

const Schools = () => {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [editedSchool, setEditedSchool] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [schoolCredit, setSchoolCredit] = useState(null);

  const loadingRef = useRef(null);
  const observer = useRef(null);
  const searchInputRef = useRef(null);

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
      toast.error(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, searchTerm]);

  // Arama input değişikliği için callback
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Arama fonksiyonunu useCallback ile optimize et
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
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      // Arama tamamlandıktan sonra input'a focus ol
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
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

  // Sayfa yüklendiğinde input'a focus ol
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Otomatik arama kaldırıldı - sadece Enter'a basıldığında arama yapılacak

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

  useEffect(() => {
    if (isModalOpen) {
      const original = document.body.style.overflowY;
      document.body.style.overflowY = "hidden";
      return () => {
        document.body.style.overflowY = original;
      };
    }
  }, [isModalOpen]);

  const handleOpenModal = useCallback(async (school) => {
    setSelectedSchool(school);
    setEditedSchool(school);
    setIsModalOpen(true);

    try {
      const credit = await getCreditBySchoolName(school.okul_adi);
      setSchoolCredit(credit);
    } catch (error) {
      setSchoolCredit(null);
    }
  }, []);

  const handleCloseModal = () => {
    setSelectedSchool(null);
    setEditedSchool(null);
    setIsModalOpen(false);
    setShowPassword(false);
    setSchoolCredit(null);
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

      // Backend'e gönderilecek veriyi hazırla (camelCase formatında)
      const updateData = {
        okulAdi: editedSchool.okul_adi,
        okulTuru: editedSchool.okul_turu,
        adres: editedSchool.adres,
        ilce: editedSchool.ilce,
        il: editedSchool.il,
        eposta: editedSchool.eposta,
        telefon: editedSchool.telefon,
        website: editedSchool.website,
        ogrenciSayisi: editedSchool.ogrenci_sayisi,
        gorusulecekYetkili: editedSchool.gorusulecek_yetkili,
        yetkiliTelefon: editedSchool.yetkili_telefon,
        kullaniciAdi: editedSchool.kullanici_adi,
        sifre: editedSchool.sifre,
        durum: editedSchool.durum,
      };

      await updateSchool(editedSchool.id, updateData);

      // Frontend state'ini güncelle
      setSchools(
        schools.map((school) =>
          school.id === editedSchool.id ? editedSchool : school
        )
      );
      toast.success("Okul başarıyla güncellendi!");
      handleCloseModal();
    } catch (error) {
      console.error("Okul güncellenirken hata oluştu:", error);
      const errorMessage =
        error.message || "Okul güncellenirken bir hata oluştu!";
      toast.error(errorMessage);
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
        setTotalCount((prev) => prev - 1);
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

  const handleSetPassive = async () => {
    try {
      setIsSaving(true);
      await setSchoolPassive(editedSchool.id);
      const updated = { ...editedSchool, durum: "pasif" };
      setSchools(
        schools.map((school) =>
          school.id === editedSchool.id ? updated : school
        )
      );
      toast.success("Okul pasif yapıldı!");
      setEditedSchool(updated);
    } catch (error) {
      console.error("Okul pasif yapılırken hata oluştu:", error);
      toast.error("Okul pasif yapılırken bir hata oluştu!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActive = async () => {
    try {
      setIsSaving(true);
      await setSchoolActive(editedSchool.id);
      const updated = { ...editedSchool, durum: "aktif" };
      setSchools(
        schools.map((school) =>
          school.id === editedSchool.id ? updated : school
        )
      );
      toast.success("Okul aktif yapıldı!");
      setEditedSchool(updated);
    } catch (error) {
      console.error("Okul aktif yapılırken hata oluştu:", error);
      toast.error("Okul aktif yapılırken bir hata oluştu!");
    } finally {
      setIsSaving(false);
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
                  ref={searchInputRef}
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

        {/* Okul Kartları */}
        <SchoolsList
          schools={schools}
          onSchoolClick={handleOpenModal}
          loading={loading}
          hasMore={hasMore}
          searchTerm={searchTerm}
          loadingRef={loadingRef}
        />

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
                        ID:{" "}
                        {editedSchool?.id
                          ? String(editedSchool.id).slice(0, 8)
                          : ""}
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        Kayıt: {tarihFormatla(editedSchool?.created_at)}
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
                      value={editedSchool?.okul_adi || ""}
                      onChange={(e) =>
                        handleInputChange("okul_adi", e.target.value)
                      }
                    />
                    <CustomDropdown
                      label="Okul Türü"
                      options={[
                        { value: "devlet", label: "Devlet Okulu" },
                        { value: "özel", label: "Özel Okul" },
                      ]}
                      value={editedSchool?.okul_turu || ""}
                      onChange={(e) =>
                        handleInputChange("okul_turu", e.target.value)
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
                      value={editedSchool?.ogrenci_sayisi || ""}
                      onChange={(e) =>
                        handleInputChange("ogrenci_sayisi", e.target.value)
                      }
                    />
                    <FormField
                      label="Yetkili Kişi"
                      value={editedSchool?.gorusulecek_yetkili || ""}
                      onChange={(e) =>
                        handleInputChange("gorusulecek_yetkili", e.target.value)
                      }
                    />
                    <FormField
                      label="Yetkili Telefon"
                      type="tel"
                      value={editedSchool?.yetkili_telefon || ""}
                      onChange={(e) =>
                        handleInputChange("yetkili_telefon", e.target.value)
                      }
                    />
                    <FormField
                      label="Kredi"
                      value={
                        schoolCredit
                          ? `${schoolCredit.kredi_miktari} kredi`
                          : "Kredi yok"
                      }
                      readOnly
                    />
                    <FormField
                      label="Kullanıcı Adı"
                      value={editedSchool?.kullanici_adi || ""}
                      onChange={(e) =>
                        handleInputChange("kullanici_adi", e.target.value)
                      }
                    />
                    <div className="relative">
                      <FormField
                        label="Şifre"
                        type={showPassword ? "text" : "password"}
                        value={editedSchool?.sifre || ""}
                        onChange={(e) =>
                          handleInputChange("sifre", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 -bottom-6 cursor-pointer text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? "Gizle" : "Göster"}
                      </button>
                    </div>
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
                    {editedSchool?.durum === "aktif" ? (
                      <button
                        onClick={handleSetPassive}
                        disabled={isSaving}
                        className="cursor-pointer flex items-center px-4 py-2 text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm"
                      >
                        <CiPause1 className="mr-2" />
                        Pasif Yap
                      </button>
                    ) : (
                      <button
                        onClick={handleSetActive}
                        disabled={isSaving}
                        className="cursor-pointer flex items-center px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
                      >
                        <GoCheck className="mr-2" />
                        Aktif Yap
                      </button>
                    )}
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
