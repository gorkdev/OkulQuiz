import { db } from "./firebase";
import { addDoc, collection } from "firebase/firestore";

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
