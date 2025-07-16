import { db } from "./firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  startAfter,
  getDoc
} from "firebase/firestore";

/**
 * Firestore'da Kategoriler koleksiyonuna yeni kategori ekler.
 * @param {Object} categoryData - { kategoriAdi, aciklama, durum }
 * @returns {Promise<string>} - Eklenen dokümanın ID'si
 */
export const addCategory = async (categoryData) => {
  if (!categoryData || typeof categoryData !== "object") {
    throw new Error("Kategori verisi doğru formatta olmalı");
  }
  const docRef = await addDoc(collection(db, "Kategoriler"), categoryData);
  return docRef.id;
};

/**
 * Aynı isimde kategori var mı kontrol eder.
 * @param {string} kategoriAdi
 * @returns {Promise<boolean>} - true: alınmış, false: alınmamış
 */
export const isCategoryNameTaken = async (kategoriAdi) => {
  if (!kategoriAdi) return false;
  const q = query(
    collection(db, "Kategoriler"),
    where("kategoriAdi", "==", kategoriAdi)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Kategorileri sayfalı olarak getirir
 * @param {number} pageSize
 * @param {string|null} lastDocId
 * @returns {Promise<{categories: Array, hasMore: boolean, lastDoc: string|null}>}
 */
export const getCategoriesPaginated = async (pageSize = 6, lastDocId = null) => {
  let categoriesQuery;
  if (lastDocId) {
    const lastDocRef = doc(db, "Kategoriler", lastDocId);
    const lastDocSnap = await getDoc(lastDocRef);
    categoriesQuery = query(
      collection(db, "Kategoriler"),
      orderBy("kategoriAdi"),
      startAfter(lastDocSnap),
      limit(pageSize)
    );
  } else {
    categoriesQuery = query(
      collection(db, "Kategoriler"),
      orderBy("kategoriAdi"),
      limit(pageSize)
    );
  }
  const querySnapshot = await getDocs(categoriesQuery);
  const categories = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const hasMore = categories.length === pageSize;
  const lastDoc = categories.length > 0 ? categories[categories.length - 1].id : null;
  return { categories, hasMore, lastDoc };
};

/**
 * Kategori günceller
 * @param {string} categoryId
 * @param {Object} categoryData
 */
export const updateCategory = async (categoryId, categoryData) => {
  const categoryRef = doc(db, "Kategoriler", categoryId);
  await updateDoc(categoryRef, categoryData);
};

/**
 * Kategori siler
 * @param {string} categoryId
 */
export const deleteCategory = async (categoryId) => {
  const categoryRef = doc(db, "Kategoriler", categoryId);
  await deleteDoc(categoryRef);
};

/**
 * Kategoriyi pasif yapar (durum: false)
 * @param {string} categoryId
 */
export const setCategoryPassive = async (categoryId) => {
  const categoryRef = doc(db, "Kategoriler", categoryId);
  await updateDoc(categoryRef, { durum: false });
};

/**
 * Kategoriyi aktif yapar (durum: true)
 * @param {string} categoryId
 */
export const setCategoryActive = async (categoryId) => {
  const categoryRef = doc(db, "Kategoriler", categoryId);
  await updateDoc(categoryRef, { durum: true });
}; 