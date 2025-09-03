import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiMail,
  FiPhone,
  FiUsers,
  FiMapPin,
  FiChevronRight,
} from "react-icons/fi";
import { tarihFormatla } from "@/hooks/tarihFormatla";

const SchoolsList = memo(
  ({ schools, onSchoolClick, loading, hasMore, searchTerm, loadingRef }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (schools.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-center py-16"
        >
          <div className="text-gray-400 text-lg">
            {searchTerm
              ? "Arama kriterine uygun okul bulunamadı"
              : "Henüz okul eklenmemiş"}
          </div>
        </motion.div>
      );
    }

    return (
      <>
        {/* Okul Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {schools.map((school) => (
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
                      {school.okul_adi}
                    </h3>
                    <span
                      className={`px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                        school.okul_turu === "devlet"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {school.okul_turu === "devlet" ? "Devlet" : "Özel"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-3 flex-shrink-0 text-blue-500" />
                      <span className="font-medium truncate">
                        {school.ogrenci_sayisi} Öğrenci
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
                        {tarihFormatla(school.created_at)}
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
                    onClick={() => onSchoolClick(school)}
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
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }
);

export default SchoolsList;
