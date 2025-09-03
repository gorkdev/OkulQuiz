/**
 * Okul Servisi - MySQL Versiyonu
 * Firebase schoolService.js'in MySQL backend ile çalışan versiyonu
 */

const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";

/**
 * Yeni okul ekler.
 * @param {Object} schoolData - Okul bilgileri: { name, address, email, phone, ... }
 * @returns {Promise<Object>} - Eklenen okul bilgileri
 * @throws Hata varsa fırlatır.
 */
export const addSchool = async (schoolData) => {
  if (!schoolData || typeof schoolData !== "object") {
    throw new Error("Okul verisi doğru formatta olmalı");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/schools.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schoolData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Okul eklenirken hata oluştu");
    }

    return result.data;
  } catch (error) {
    console.error("addSchool hatası:", error);
    throw error;
  }
};

/**
 * Tüm okulları getirir.
 * @param {number} limit - Limit
 * @param {number} offset - Offset
 * @returns {Promise<Array>} - Okulların listesi
 * @throws Hata varsa fırlatır.
 */
export const getSchools = async (limit = null, offset = 0) => {
  try {
    let url = `${API_BASE_URL}/schools.php`;
    const params = new URLSearchParams();

    if (limit) params.append("limit", limit);
    if (offset) params.append("offset", offset);

    if (params.toString()) {
      url += "?" + params.toString();
    }

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Okullar getirilirken hata oluştu");
    }

    return result.data;
  } catch (error) {
    console.error("getSchools hatası:", error);
    throw error;
  }
};

/**
 * Okulları sayfalı olarak getirir
 * @param {number} page - Sayfa numarası
 * @param {number} pageSize - Sayfa başına okul sayısı
 * @param {string} search - Arama terimi
 * @returns {Promise<Object>} - Sayfalı okullar listesi
 */
export const getSchoolsPaginated = async (
  page = 1,
  pageSize = 6,
  search = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const url = `${API_BASE_URL}/schools.php?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Okullar getirilirken hata oluştu");
    }

    // Backend'den gelen format ile frontend'in beklediği format arasında uyumluluk sağla
    return {
      schools: result.data.schools || [],
      lastDoc: result.data.pagination?.current_page || null,
      hasMore: result.data.pagination?.has_more || false,
      totalCount: result.data.pagination?.total_count || 0,
    };
  } catch (error) {
    console.error("getSchoolsPaginated hatası:", error);
    if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Okullar yüklenirken bir hata oluştu");
    }
  }
};

/**
 * ID'ye göre okul getirir
 * @param {number} schoolId - Okul ID'si
 * @returns {Promise<Object>} - Okul bilgileri
 */
export const getSchoolById = async (schoolId) => {
  try {
    const url = `${API_BASE_URL}/schools.php?id=${schoolId}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Okul getirilirken hata oluştu");
    }

    return result.data;
  } catch (error) {
    console.error("getSchoolById hatası:", error);
    throw error;
  }
};

/**
 * Okul günceller
 * @param {number} schoolId - Okul ID'si
 * @param {Object} schoolData - Güncellenecek veriler
 * @returns {Promise<Object>} - Güncellenmiş okul bilgileri
 */
export const updateSchool = async (schoolId, schoolData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schools.php?id=${schoolId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schoolData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Okul güncellenirken hata oluştu");
    }

    return result.data;
  } catch (error) {
    console.error("updateSchool hatası:", error);
    throw error;
  }
};

/**
 * Okul siler
 * @param {number} schoolId - Okul ID'si
 * @returns {Promise<void>}
 */
export const deleteSchool = async (schoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schools.php?id=${schoolId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Okul silinirken hata oluştu");
    }
  } catch (error) {
    console.error("deleteSchool hatası:", error);
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

  try {
    // Tüm okulları getir ve kullanıcı adını kontrol et
    const schools = await getSchools();
    return schools.some((school) => school.kullanici_adi === username);
  } catch (error) {
    console.error("isUsernameTaken hatası:", error);
    return false;
  }
};

/**
 * E-posta adresi daha önce alınmış mı kontrol eder.
 * @param {string} email - Kontrol edilecek e-posta adresi
 * @returns {Promise<boolean>} - true: alınmış, false: alınmamış
 */
export const isEmailTaken = async (email) => {
  if (!email) return false;

  try {
    // Tüm okulları getir ve e-posta adresini kontrol et
    const schools = await getSchools();
    return schools.some((school) => school.eposta === email);
  } catch (error) {
    console.error("isEmailTaken hatası:", error);
    return false;
  }
};

/**
 * Telefon numarası daha önce alınmış mı kontrol eder.
 * @param {string} phone - Kontrol edilecek telefon numarası
 * @returns {Promise<boolean>} - true: alınmış, false: alınmamış
 */
export const isPhoneTaken = async (phone) => {
  if (!phone) return false;

  try {
    // Tüm okulları getir ve telefon numarasını kontrol et
    const schools = await getSchools();
    return schools.some((school) => school.telefon === phone);
  } catch (error) {
    console.error("isPhoneTaken hatası:", error);
    return false;
  }
};

/**
 * Okulu pasif yapar.
 * @param {number} schoolId - Pasif yapılacak okulun ID'si
 * @returns {Promise<void>}
 */
export const setSchoolPassive = async (schoolId) => {
  try {
    await updateSchool(schoolId, { durum: "pasif" });
  } catch (error) {
    console.error("setSchoolPassive hatası:", error);
    throw error;
  }
};

/**
 * Okulu aktif yapar.
 * @param {number} schoolId - Aktif yapılacak okulun ID'si
 * @returns {Promise<void>}
 */
export const setSchoolActive = async (schoolId) => {
  try {
    await updateSchool(schoolId, { durum: "aktif" });
  } catch (error) {
    console.error("setSchoolActive hatası:", error);
    throw error;
  }
};
