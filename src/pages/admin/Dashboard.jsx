import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import AdminHeader from "@/components/AdminHeader/AdminHeader";

const tableData = [
  { id: 4, name: "Volkan Kukul", email: "volkan@gmail.com", role: "Admin" },
  { id: 2, name: "Ercan Polat", email: "ercan@gmail.com", role: "Moderator" },
  { id: 3, name: "Alper Demir", email: "alper@gmail.com", role: "User" },
  { id: 1, name: "Görkem Üveyk", email: "gorkem@gmail.com", role: "Moderator" },
];

const roleColors = {
  Admin: "bg-blue-100 text-blue-700",
  User: "bg-green-100 text-green-700",
  Moderator: "bg-yellow-100 text-yellow-700",
};

const Dashboard = () => {
  const [search, setSearch] = useState("");

  const filteredData = tableData.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase()) ||
      row.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminHeader title="Panel" />
      {/* Example Cards */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="text-sm text-gray-500">Kart Başlığı {i}</div>
            <div className="text-2xl font-bold text-gray-800">123</div>
            <div className="text-xs text-green-500">Geçen haftaya göre +%5</div>
          </div>
        ))}
      </motion.section>

      {/* Table Area */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white rounded-xl shadow-md p-4 md:p-8 min-h-[300px]"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Kullanıcılar Tablosu
          </h2>
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full md:w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-50">
                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Kullanıcı
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  E-posta
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600">Rol</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-blue-50 transition-colors group"
                  >
                    <td className="px-4 py-3">{row.id}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                        {row.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <span className="font-medium text-gray-800">
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          roleColors[row.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {row.role === "Admin"
                          ? "Yönetici"
                          : row.role === "User"
                          ? "Kullanıcı"
                          : row.role === "Moderator"
                          ? "Moderatör"
                          : row.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <button
                        className="p-2 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Düzenle"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
                        title="Sil"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </>
  );
};

export default Dashboard;
