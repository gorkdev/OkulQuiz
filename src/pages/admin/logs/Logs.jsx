import React, { useEffect, useRef, useState } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import Loader from "../../../components/Loader";
import { fetchLogs } from "../../../services/firebase/logService";

const PAGE_SIZE = 10;

const Logs = () => {
  const lastDocRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // İlk açılışta ilk sayfa yükle
  useEffect(() => {
    const fetchInitial = async () => {
      setInitialLoading(true);
      try {
        const {
          logs: firstLogs,
          hasMore,
          lastDoc,
        } = await fetchLogs({ pageSize: PAGE_SIZE });
        setLogs(firstLogs);
        setHasMore(hasMore);
        lastDocRef.current = lastDoc;
      } catch (err) {
        setError("Loglar yüklenirken hata oluştu.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Daha fazla yükle butonu
  const handleLoadMore = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        logs: newLogs,
        hasMore,
        lastDoc,
      } = await fetchLogs({
        pageSize: PAGE_SIZE,
        lastDocSnap: lastDocRef.current,
      });
      setLogs((prev) => [...prev, ...newLogs]);
      setHasMore(hasMore);
      lastDocRef.current = lastDoc;
    } catch (err) {
      setError("Loglar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <AdminHeader title="Log Geçmişi" />
      <div className="bg-white rounded-2xl shadow-xl mt-8 p-6 max-w-5xl mx-auto">
        {error && <div className="text-red-500 text-center py-8">{error}</div>}
        {initialLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader className="h-12" />
            <div className="text-gray-400 mt-2">Yükleniyor...</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 sticky top-0 z-10">
                    <th className="py-4 px-6 font-semibold text-base rounded-tl-2xl">
                      Tarih
                    </th>
                    <th className="py-4 px-6 font-semibold text-base">
                      Başlık
                    </th>
                    <th className="py-4 px-6 font-semibold text-base rounded-tr-2xl">
                      Açıklama
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-16">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-7z"
                            />
                          </svg>
                          <span className="text-lg">Kayıt bulunamadı.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition-all duration-200 bg-white hover:bg-blue-50 shadow-md rounded-xl border-b border-gray-100 group"
                      >
                        <td className="py-4 px-6 whitespace-nowrap rounded-l-xl align-top">
                          <span className="block font-medium text-gray-700 group-hover:text-blue-700">
                            {log.timestamp?.seconds
                              ? new Date(
                                  log.timestamp.seconds * 1000
                                ).toLocaleString("tr-TR", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 align-top max-w-xs">
                          <span className="block font-semibold text-gray-900 text-base group-hover:text-blue-800 truncate">
                            {log.title}
                          </span>
                        </td>
                        <td className="py-4 px-6 align-top max-w-md">
                          <span className="block text-gray-600 group-hover:text-blue-700 break-words">
                            {log.details}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Daha fazla yükle butonu */}
            <div className="flex flex-col items-center py-6">
              {loading && (
                <>
                  <Loader className="h-12" />
                  <div className="text-gray-400 mt-2">Yükleniyor...</div>
                </>
              )}
              {!loading && hasMore && logs.length > 0 && (
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  Daha Fazla Yükle
                </button>
              )}
              {!hasMore && logs.length > 0 && (
                <div className="text-gray-400 mt-2">Daha fazla kayıt yok.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
