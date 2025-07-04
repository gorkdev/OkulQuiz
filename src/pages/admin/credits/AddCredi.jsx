import React, { useState, useEffect } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import FormField from "../../../components/FormTemplate/FormField";
import {
  getSchools,
  updateSchool,
} from "../../../services/firebase/schoolService";

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

  const filteredSchools = schools.filter((school) => {
    const name = school.name || school.okulAdi || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (err) {
        // Hata yönetimi
        alert("Okullar yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  // Dışarı tıklayınca kapama
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        modalOpen
      ) {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

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
      {/* Okul kartları */}
      <div className="space-y-4">
        {loading ? (
          <div>Yükleniyor...</div>
        ) : filteredSchools.length === 0 ? (
          <div>Hiç okul bulunamadı.</div>
        ) : (
          filteredSchools.map((school) => (
            <div
              key={school.id}
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
                    setModalInitialCredit(school.kredi || "");
                    setModalOpen(true);
                  }}
                >
                  Kredi Ata
                </button>
              </div>
            </div>
          ))
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
              <span className="inline-block text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg shadow-sm">
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
            className="mb-2"
            min={0}
            max={999999}
            autoFocus
          />
          <div className="flex justify-center gap-4 mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow transition-transform duration-150 hover:scale-110 cursor-pointer"
              onClick={() => {
                if (!modalSchool) return;
                if (modalCredit === "" || isNaN(Number(modalCredit))) return;
                const mevcut =
                  newCredit !== null
                    ? newCredit
                    : Number(modalSchool.kredi) || 0;
                const girilen = Number(modalCredit);
                setNewCredit(mevcut + girilen);
                setModalCredit("");
              }}
              type="button"
              title="Ekle"
            >
              +
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow transition-transform duration-150 hover:scale-110 cursor-pointer"
              onClick={() => {
                if (!modalSchool) return;
                if (modalCredit === "" || isNaN(Number(modalCredit))) return;
                const mevcut =
                  newCredit !== null
                    ? newCredit
                    : Number(modalSchool.kredi) || 0;
                const girilen = Number(modalCredit);
                setNewCredit(mevcut - girilen);
                setModalCredit("");
              }}
              type="button"
              title="Çıkar"
            >
              –
            </button>
          </div>
          {/* Yeni kredi büyük şekilde gösterilsin, sadece input boş değilse ve newCredit null değilse */}
          {modalCredit === "" && newCredit === null
            ? null
            : newCredit !== null && (
                <div className="text-center mb-4">
                  <span
                    className={`inline-block text-3xl font-bold px-6 py-3 rounded-lg shadow-sm ${
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
              onClick={() => setModalOpen(false)}
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
                  setModalOpen(false);
                } catch (err) {
                  alert("Kredi atanırken hata oluştu");
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
    </div>
  );
};

export default AddCredi;
