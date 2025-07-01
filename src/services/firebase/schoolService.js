import { db } from "./firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  startAfter,
  getDoc,
  where,
} from "firebase/firestore";

/**
 * Yeni okul ekler.
 * @param {Object} schoolData - Okul bilgileri: { name, address, email, phone, ... }
 * @returns {Promise<string>} - Eklenen dokümanın ID'si
 * @throws Hata varsa fırlatır.
 */
export const addSchool = async (schoolData) => {
  if (!schoolData || typeof schoolData !== "object") {
    throw new Error("Okul verisi doğru formatta olmalı");
  }

  // Burada ister ekstra validasyon yapabilirsin.

  const docRef = await addDoc(collection(db, "Okullar"), schoolData);
  return docRef.id;
};

/**
 * Tüm okulları getirir.
 * @returns {Promise<Array>} - Okulların listesi
 * @throws Hata varsa fırlatır.
 */
export const getSchools = async () => {
  try {
    console.log("getSchools fonksiyonu çağrıldı");
    console.log("Firestore bağlantısı:", db);

    const schoolsQuery = query(
      collection(db, "Okullar"),
      orderBy("okulSistemKayitTarihi", "desc")
    );
    console.log("Query oluşturuldu:", schoolsQuery);

    const querySnapshot = await getDocs(schoolsQuery);
    console.log("Query snapshot alındı, döküman sayısı:", querySnapshot.size);

    const schools = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Dönüştürülen okul verileri:", schools);
    return schools;
  } catch (error) {
    console.error("getSchools fonksiyonunda hata:", error);
    throw error;
  }
};

export const updateSchool = async (schoolId, schoolData) => {
  try {
    const schoolRef = doc(db, "Okullar", schoolId);
    await updateDoc(schoolRef, schoolData);
  } catch (error) {
    console.error("Error updating school:", error);
    throw error;
  }
};

export const deleteSchool = async (schoolId) => {
  try {
    const schoolRef = doc(db, "Okullar", schoolId);
    await deleteDoc(schoolRef);
  } catch (error) {
    console.error("Error deleting school:", error);
    throw error;
  }
};

/**
 * Okulları sayfalı olarak getirir
 * @param {number} page - Sayfa numarası
 * @param {number} pageSize - Sayfa başına okul sayısı
 * @param {string} lastDocId - Son okunan dokümanın ID'si (ilk sayfa için null)
 * @returns {Promise<Array>} - Okulların listesi
 */
export const getSchoolsPaginated = async (pageSize = 6, lastDocId = null) => {
  try {
    let schoolsQuery;

    if (lastDocId) {
      // Sonraki sayfa için son dokümanı al
      const lastDocRef = doc(db, "Okullar", lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);

      schoolsQuery = query(
        collection(db, "Okullar"),
        orderBy("okulSistemKayitTarihi", "desc"),
        startAfter(lastDocSnap),
        limit(pageSize)
      );
    } else {
      // İlk sayfa için
      schoolsQuery = query(
        collection(db, "Okullar"),
        orderBy("okulSistemKayitTarihi", "desc"),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(schoolsQuery);
    const schools = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const hasMore = schools.length === pageSize;
    const lastDoc = schools[schools.length - 1]?.id || null;

    return {
      schools,
      hasMore,
      lastDoc,
    };
  } catch (error) {
    console.error("getSchoolsPaginated fonksiyonunda hata:", error);
    throw error;
  }
};

/**
 * Kullanıcı adı daha önce alınmış mı kontrol eder.
 * @param {string} username - Kontrol edilecek kullanıcı adı
 * @returns {Promise<boolean>} - true: alınmış, false: alınmamış
 */
export const isUsernameTaken = async (username) => {
  if (!username) return false;
  const q = query(
    collection(db, "Okullar"),
    where("kullaniciAdi", "==", username)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
