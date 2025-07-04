import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  addDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";

/**
 * Firestore'dan log kayıtlarını çeker (arama ve sayfalama yönetimiyle birlikte).
 * @param {Object} options - { search, pageSize, lastDocSnap }
 * @returns {Promise<{logs: Array, hasMore: boolean, lastDoc: any}>}
 */
export const fetchLogs = async ({
  search = "",
  pageSize = 10,
  lastDocSnap = null,
} = {}) => {
  const logsCollection = collection(db, "Logs");

  if (search) {
    // Firestore'da 'or' sorgusu olmadığı için iki ayrı sorgu yapıp birleştiriyoruz
    const lower = search.toLowerCase();
    // Title'da arama
    let titleQuery = query(
      logsCollection,
      orderBy("title"),
      orderBy("timestamp", "desc"),
      where("title", ">=", search),
      where("title", "<=", search + "\uf8ff"),
      limit(pageSize)
    );
    if (lastDocSnap && lastDocSnap.title) {
      titleQuery = query(
        titleQuery,
        startAfter(lastDocSnap.title, lastDocSnap.timestamp)
      );
    }
    const titleSnapshot = await getDocs(titleQuery);
    let logs = titleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Details'da arama (title ile eşleşmeyenleri ekle)
    let detailsQuery = query(
      logsCollection,
      orderBy("details"),
      orderBy("timestamp", "desc"),
      where("details", ">=", search),
      where("details", "<=", search + "\uf8ff"),
      limit(pageSize)
    );
    if (lastDocSnap && lastDocSnap.details) {
      detailsQuery = query(
        detailsQuery,
        startAfter(lastDocSnap.details, lastDocSnap.timestamp)
      );
    }
    const detailsSnapshot = await getDocs(detailsQuery);
    let detailsLogs = detailsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Title ve details sonuçlarını birleştir, tekrarları kaldır
    const allLogsMap = new Map();
    logs.concat(detailsLogs).forEach((log) => {
      allLogsMap.set(log.id, log);
    });
    const allLogs = Array.from(allLogsMap.values())
      .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
      .slice(0, pageSize);
    const hasMore = allLogs.length === pageSize;
    const lastDoc = allLogs.length > 0 ? allLogs[allLogs.length - 1] : null;
    return { logs: allLogs, hasMore, lastDoc };
  } else {
    // Arama yoksa, sayfalama ile çek
    let logsQuery = query(
      logsCollection,
      orderBy("timestamp", "desc"),
      limit(pageSize)
    );
    if (lastDocSnap) {
      logsQuery = query(logsQuery, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(logsQuery);
    const logs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const hasMore = logs.length === pageSize;
    const lastDoc = querySnapshot.docs[logs.length - 1] || null;
    return { logs, hasMore, lastDoc };
  }
};

/**
 * Firestore'a yeni log kaydı ekler.
 * @param {Object} logData - { title, details }
 * @returns {Promise<string>} - Eklenen logun ID'si
 */
export const addLog = async (logData) => {
  if (!logData || typeof logData !== "object" || !logData.title) {
    throw new Error("Log verisi doğru formatta ve title içermeli");
  }
  const docRef = await addDoc(collection(db, "Logs"), {
    title: logData.title,
    details: logData.details || "",
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Toplam log sayısını döndürür (arama ile birlikte).
 * @param {string} search
 * @returns {Promise<number>}
 */
export const getLogsCount = async (search = "") => {
  const logsCollection = collection(db, "Logs");
  if (!search) {
    // Tüm loglar için count
    const snapshot = await getCountFromServer(logsCollection);
    return snapshot.data().count || 0;
  } else {
    // Firestore'da OR count yok, iki ayrı count alıp birleştir
    const titleQuery = query(
      logsCollection,
      where("title", ">=", search),
      where("title", "<=", search + "\uf8ff")
    );
    const detailsQuery = query(
      logsCollection,
      where("details", ">=", search),
      where("details", "<=", search + "\uf8ff")
    );
    const [titleSnap, detailsSnap] = await Promise.all([
      getCountFromServer(titleQuery),
      getCountFromServer(detailsQuery),
    ]);
    // Toplamı döndür, tekrarları azaltmak için minimumunu dönebiliriz ama burada topluyoruz
    return (titleSnap.data().count || 0) + (detailsSnap.data().count || 0);
  }
};
