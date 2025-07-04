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

  const filteredSchools = schools.filter((school) =>
    Object.values(school).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (err) {
        // Hata yönetimi
        alert("Okullar yüklenirken hata olmuştur");
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

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
      <div className="space-y-2">
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
                {selectedSchoolId === school.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={creditValue}
                      onChange={(e) => setCreditValue(e.target.value)}
                      placeholder="Kredi"
                      min={0}
                    />
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await updateSchool(school.id, {
                            ...school,
                            kredi: Number(creditValue),
                          });
                          setSchools((prev) =>
                            prev.map((s) =>
                              s.id === school.id
                                ? { ...s, kredi: Number(creditValue) }
                                : s
                            )
                          );
                          setSelectedSchoolId(null);
                          setCreditValue("");
                        } catch (err) {
                          alert("Kredi atanırken hata oluştu");
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Kaydet
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
                      onClick={() => {
                        setSelectedSchoolId(null);
                        setCreditValue("");
                      }}
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelectedSchoolId(school.id);
                      setCreditValue(school.kredi || "");
                    }}
                  >
                    Kredi Ata
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddCredi;
