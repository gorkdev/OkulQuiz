import { db, storage } from './firebase';
import { collection, addDoc, Timestamp, query, orderBy, limit, startAfter, getDocs, getDoc, doc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Tek bir dosyayı storage'a yükler ve URL döner
export async function uploadFileToStorage(file, path) {
  if (!file) return null;
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Firestore'a soru ekler
export async function addQuestionToFirestore(questionData) {
  const questionsRef = collection(db, 'Sorular');
  const docRef = await addDoc(questionsRef, {
    ...questionData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// Tüm soruları sayfalı olarak getirir
export async function getQuestionsPaginated(pageSize = 10, lastDocId = null) {
  let questionsQuery;
  if (lastDocId) {
    const lastDocRef = doc(db, 'Sorular', lastDocId);
    const lastDocSnap = await getDoc(lastDocRef);
    questionsQuery = query(
      collection(db, 'Sorular'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDocSnap),
      limit(pageSize)
    );
  } else {
    questionsQuery = query(
      collection(db, 'Sorular'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  const querySnapshot = await getDocs(questionsQuery);
  const questions = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const hasMore = questions.length === pageSize;
  const lastDoc = questions.length > 0 ? questions[questions.length - 1].id : null;
  return { questions, hasMore, lastDoc };
}

// Firestore'da arama ile soruları getirir
export async function searchQuestions({ search = "", pageSize = 10, lastDocSnap = null } = {}) {
  if (!search) {
    // Arama yoksa normal paginated çek
    return await getQuestionsPaginated(pageSize, lastDocSnap);
  }
  const questionsCollection = collection(db, "Sorular");
  const lower = search.toLowerCase();
  let allQuestionsMap = new Map();
  let lastDoc = null;
  let hasMore = false;
  let errorIndexLink = null;

  // Soru metni ile arama
  try {
    let q1 = query(
      questionsCollection,
      orderBy("soruMetni"),
      where("soruMetni", ">=", search),
      where("soruMetni", "<=", search + "\uf8ff"),
      limit(pageSize)
    );
    if (lastDocSnap && lastDocSnap.soruMetni) {
      q1 = query(q1, startAfter(lastDocSnap.soruMetni));
    }
    const snap1 = await getDocs(q1);
    snap1.docs.forEach(docu => allQuestionsMap.set(docu.id, { id: docu.id, ...docu.data() }));
    if (snap1.docs.length === pageSize) hasMore = true;
    if (snap1.docs.length > 0) lastDoc = snap1.docs[snap1.docs.length - 1];
  } catch (err) {
    if (err.code === 'failed-precondition' || err.code === 'permission-denied' || err.message?.includes('index')) {
      errorIndexLink = err.message.match(/https?:\/\/[^\s]+/g)?.[0];
    }
  }

  // Kategori adı ile arama
  try {
    let q2 = query(
      questionsCollection,
      orderBy("kategori.kategoriAdi"),
      where("kategori.kategoriAdi", ">=", search),
      where("kategori.kategoriAdi", "<=", search + "\uf8ff"),
      limit(pageSize)
    );
    if (lastDocSnap && lastDocSnap["kategori.kategoriAdi"]) {
      q2 = query(q2, startAfter(lastDocSnap["kategori.kategoriAdi"]));
    }
    const snap2 = await getDocs(q2);
    snap2.docs.forEach(docu => allQuestionsMap.set(docu.id, { id: docu.id, ...docu.data() }));
    if (snap2.docs.length === pageSize) hasMore = true;
    if (snap2.docs.length > 0) lastDoc = snap2.docs[snap2.docs.length - 1];
  } catch (err) {
    if (err.code === 'failed-precondition' || err.code === 'permission-denied' || err.message?.includes('index')) {
      errorIndexLink = err.message.match(/https?:\/\/[^\s]+/g)?.[0];
    }
  }

  // Zorluk ile arama
  try {
    let q3 = query(
      questionsCollection,
      orderBy("zorluk"),
      where("zorluk", ">=", search),
      where("zorluk", "<=", search + "\uf8ff"),
      limit(pageSize)
    );
    if (lastDocSnap && lastDocSnap.zorluk) {
      q3 = query(q3, startAfter(lastDocSnap.zorluk));
    }
    const snap3 = await getDocs(q3);
    snap3.docs.forEach(docu => allQuestionsMap.set(docu.id, { id: docu.id, ...docu.data() }));
    if (snap3.docs.length === pageSize) hasMore = true;
    if (snap3.docs.length > 0) lastDoc = snap3.docs[snap3.docs.length - 1];
  } catch (err) {
    if (err.code === 'failed-precondition' || err.code === 'permission-denied' || err.message?.includes('index')) {
      errorIndexLink = err.message.match(/https?:\/\/[^\s]+/g)?.[0];
    }
  }

  const questions = Array.from(allQuestionsMap.values());
  return { questions, hasMore, lastDoc, errorIndexLink };
}

// Yeni: Belirli bir kategoriye ait soru sayısını getirir
export async function getQuestionCountByCategoryName(kategoriAdi) {
  if (!kategoriAdi) return 0;
  const questionsCollection = collection(db, "Sorular");
  const q = query(
    questionsCollection,
    where("kategori.kategoriAdi", "==", kategoriAdi)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}

/**
 * Belirli bir kategoriye ait soruları sayfalı olarak getirir
 * @param {string} kategoriAdi
 * @param {number} pageSize
 * @param {string|null} lastDocId
 * @returns {Promise<{questions: Array, hasMore: boolean, lastDoc: string|null}>}
 */
export async function getQuestionsByCategoryPaginated(kategoriAdi, pageSize = 10, lastDocId = null) {
  let questionsQuery;
  if (lastDocId) {
    const lastDocRef = doc(db, 'Sorular', lastDocId);
    const lastDocSnap = await getDoc(lastDocRef);
    questionsQuery = query(
      collection(db, 'Sorular'),
      where('kategori.kategoriAdi', '==', kategoriAdi),
      orderBy('createdAt', 'desc'),
      startAfter(lastDocSnap),
      limit(pageSize)
    );
  } else {
    questionsQuery = query(
      collection(db, 'Sorular'),
      where('kategori.kategoriAdi', '==', kategoriAdi),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  const querySnapshot = await getDocs(questionsQuery);
  const questions = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const hasMore = questions.length === pageSize;
  const lastDoc = questions.length > 0 ? questions[questions.length - 1].id : null;
  return { questions, hasMore, lastDoc };
}

// Ana fonksiyon: Tüm dosyaları yükler ve Firestore'a kaydeder
export async function createQuestion(rawData) {
  // 1. Soru görsellerini yükle
  let imageUrls = [];
  if (rawData.gorselVar && Array.isArray(rawData.gorseller)) {
    imageUrls = await Promise.all(
      rawData.gorseller.map(imgObj => uploadFileToStorage(imgObj.file, 'question_images'))
    );
  } else {
    imageUrls = [];
  }

  // 2. Soru sesini yükle
  let questionAudioUrl = null;
  if (rawData.soruSesiVar && rawData.soruSesi) {
    questionAudioUrl = await uploadFileToStorage(rawData.soruSesi, 'question_audios');
  }

  // 3. Şık görselleri ve seslerini yükle
  const options = Array.isArray(rawData.siklar)
    ? await Promise.all(
        rawData.siklar.map(async (opt, idx) => {
          let imageUrl = null;
          let audioUrl = null;
          if (opt.image) imageUrl = await uploadFileToStorage(opt.image, `option_images/${idx}`);
          if (opt.audio) audioUrl = await uploadFileToStorage(opt.audio, `option_audios/${idx}`);
          return {
            ...opt,
            image: imageUrl,
            audio: audioUrl,
          };
        })
      )
    : [];

  // 4. Firestore'a kaydet
  const questionData = {
    soruMetniVar: rawData.soruMetniVar,
    soruMetni: rawData.soruMetni || "",
    soruGorseliVar: rawData.soruGorseliVar,
    soruSesiVar: rawData.soruSesiVar,
    soruSesi: questionAudioUrl,
    gorselVar: rawData.gorselVar,
    gorselSayisi: rawData.gorselSayisi,
    gorseller: imageUrls,
    sikSayisi: rawData.sikSayisi,
    siklar: options,
    dogruCevapSayisi: rawData.dogruCevapSayisi,
    dogruCevaplar: rawData.dogruCevaplar,
    zorluk: rawData.zorluk,
    sure: rawData.sure,
    puan: rawData.puan,
    sureVar: rawData.sureVar,
    puanVar: rawData.puanVar,
    soruZorunlu: rawData.soruZorunlu,
    geriBildirimVar: rawData.geriBildirimVar,
    geriBildirim: rawData.geriBildirim,
    ipucuVar: rawData.ipucuVar,
    ipucu: rawData.ipucu,
    siraliSiklar: rawData.siraliSiklar,
    hedefYas: rawData.hedefYas,
    siklariKaristir: rawData.siklariKaristir,
    createdAt: new Date(),
    // Kategori bilgisini ekle
    kategori: rawData.kategori ? { ...rawData.kategori } : null,
  };
  const id = await addQuestionToFirestore(questionData);
  return id;
}
/**
 * Belirtilen quizId'ye ait Quizler koleksiyonundaki quiz verisini getirir.
 * @param {string} quizId
 * @returns {Promise<Object|null>} - Quiz verisi (id dahil) veya null
 */
export const getQuizById = async (quizId) => {
  if (!quizId) return null;
  try {
    const { getDoc, doc } = await import("firebase/firestore");
    const { db } = await import("./firebase");
    const quizRef = doc(db, "Quizler", quizId);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      return { id: quizSnap.id, ...quizSnap.data() };
    }
    return null;
  } catch (err) {
    console.error("Quiz getirme hatası:", err);
    return null;
  }
};

/**
 * Verilen ID dizisine göre soruları topluca getirir
 * @param {string[]} ids
 * @returns {Promise<Array>}
 */
export async function getQuestionsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const promises = ids.map(id => getDoc(doc(db, 'Sorular', id)));
  const snaps = await Promise.all(promises);
  return snaps.filter(snap => snap.exists()).map(snap => ({ id: snap.id, ...snap.data() }));
}

