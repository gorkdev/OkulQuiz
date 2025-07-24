import { getFirestore, collection, getDocs, query, where, Timestamp, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getQuizzes = async () => {
  const quizCol = collection(db, "Quizler");
  const quizSnapshot = await getDocs(quizCol);
  return quizSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Yeni quiz kaydeder. Quiz adı uniq olmalı.
 * @param {Object} quizData - {
 *   quizName: string,
 *   categoryOrder: string[],
 *   questionsByCategory: { [catId: string]: string[] },
 *   questionOrderType: 'random' | 'ordered',
 *   categoryOrderType: 'random' | 'ordered'
 * }
 * @returns {Promise<string>} - Eklenen quiz dokümanının ID'si
 */
export const addQuiz = async ({ quizName, categoryOrder, questionsByCategory, questionOrderType, categoryOrderType, categoryCount, questionCount }) => {
  if (!quizName || !Array.isArray(categoryOrder) || typeof questionsByCategory !== "object") {
    throw new Error("Eksik veya hatalı quiz verisi");
  }
  // Quiz adı uniq mi kontrol et
  const q = query(collection(db, "Quizler"), where("quizName", "==", quizName));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error("Bu quiz adı zaten kullanılıyor. Lütfen farklı bir ad seçin.");
  }
  const quizDoc = {
    quizName,
    createdAt: Timestamp.now(),
    categoryOrder,
    questionsByCategory, // { catId: [soruId, ...] }
    questionsRandom: questionOrderType === 'random',
    categoriesRandom: categoryOrderType === 'random',
    categoryCount, // yeni alan
    questionCount // yeni alan
  };
  const docRef = await addDoc(collection(db, "Quizler"), quizDoc);
  return docRef.id;
}; 