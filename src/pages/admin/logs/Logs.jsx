import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const containerRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchInput]);

  // Fetch logs (initial and on search)
  useEffect(() => {
    const fetchInitial = async () => {
      setInitialLoading(true);
      setError("");
      try {
        const {
          logs: firstLogs,
          hasMore,
          lastDoc,
        } = await fetchLogs({ pageSize: PAGE_SIZE, search });
        setLogs(firstLogs);
        setHasMore(hasMore);
        lastDocRef.current = lastDoc;
      } catch (err) {
        console.error("Loglar yüklenirken hata:", err);
        if (err && err.message && err.message.toLowerCase().includes("index")) {
          setError(
            "Firestore'da gerekli index oluşturulmalı. Konsolda detaylı bilgiye bakınız."
          );
          // Firestore index link genellikle error.message içinde olur, konsola yazdır.
          if (err.message) {
            const match = err.message.match(
              /https:\/\/console\.firebase\.google\.com\/[\w\/-?&=%.]+/
            );
            if (match) {
              console.log(
                "Firestore index oluşturmak için tıklayın:",
                match[0]
              );
            }
          }
        } else {
          setError("Loglar yüklenirken hata oluştu.");
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitial();
  }, [search]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading || initialLoading || !hasMore) return;
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      handleLoadMore();
    }
  }, [loading, initialLoading, hasMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Load more logs
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
        search,
      });
      setLogs((prev) => {
        const existingIds = new Set(prev.map((log) => log.id));
        const filteredNewLogs = newLogs.filter(
          (log) => !existingIds.has(log.id)
        );
        return [...prev, ...filteredNewLogs];
      });
      setHasMore(hasMore);
      lastDocRef.current = lastDoc;
    } catch (err) {
      console.error("Loglar yüklenirken hata:", err);
      if (err && err.message && err.message.toLowerCase().includes("index")) {
        setError(
          "Firestore'da gerekli index oluşturulmalı. Konsolda detaylı bilgiye bakınız."
        );
        if (err.message) {
          const match = err.message.match(
            /https:\/\/console\.firebase\.google\.com\/[\w\/-?&=%.]+/
          );
          if (match) {
            console.log("Firestore index oluşturmak için tıklayın:", match[0]);
          }
        }
      } else {
        setError("Loglar yüklenirken hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader title="Log Geçmişi" />
      <div className="bg-white rounded-2xl shadow-xl mt-8 p-6 ml-0">
        {/* Filter input */}
        <div className="mb-4 flex items-center justify-start">
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Açıklamaya göre filtrele..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div
          ref={containerRef}
          style={{ maxHeight: "60vh", overflowY: "auto" }}
          className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50 text-left"
        >
          {error && (
            <div className="text-red-500 text-center py-8">{error}</div>
          )}
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
                      <th className="py-4 px-6 font-semibold text-base rounded-tl-2xl text-left">
                        Tarih
                      </th>
                      <th className="py-4 px-6 font-semibold text-base text-left">
                        Başlık
                      </th>
                      <th className="py-4 px-6 font-semibold text-base rounded-tr-2xl text-left">
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
                          <td className="py-4 px-6 whitespace-nowrap rounded-l-xl align-top text-left">
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
                          <td className="py-4 px-6 align-top max-w-xs text-left">
                            <span className="block font-semibold text-gray-900 text-base group-hover:text-blue-800 truncate">
                              {log.title}
                            </span>
                          </td>
                          <td className="py-4 px-6 align-top max-w-md text-left">
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
              {/* Infinite scroll loading indicator */}
              {loading && (
                <div className="flex flex-col items-center py-4">
                  <Loader className="h-8" />
                  <div className="text-gray-400 mt-2">Yükleniyor...</div>
                </div>
              )}
              {!hasMore && logs.length > 0 && (
                <div className="text-gray-400 mt-2 text-center">
                  Daha fazla kayıt yok.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
