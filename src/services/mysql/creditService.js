const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";

// Kredi ekleme
export const addCredit = async (creditData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creditData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kredi eklenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kredi ekleme hatası:", error);
    throw error;
  }
};

// Okula kredi ekleme (yeni fonksiyon)
export const addCreditToSchool = async (schoolId, creditAmount) => {
  try {
    console.log("=== CREDIT SERVICE DEBUG START ===");
    console.log("Frontend - addCreditToSchool çağrıldı:", {
      schoolId,
      creditAmount,
    });

    const url = `${API_BASE_URL}/credits.php?action=addToSchool`;
    const requestBody = {
      schoolId: schoolId,
      creditAmount: creditAmount,
    };

    console.log("Frontend - API URL:", url);
    console.log("Frontend - Request Body:", requestBody);

    const response = await fetch(url, {
      method: "POST", // PATCH yerine POST kullanıyoruz
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Frontend - Response Status:", response.status);
    console.log("Frontend - Response OK:", response.ok);

    const result = await response.json();
    console.log("Frontend - API Response:", result);

    if (!response.ok) {
      console.error("Frontend - API Error Response:", result);
      throw new Error(result.message || "Okula kredi eklenirken hata oluştu");
    }

    console.log("Frontend - API Success Response:", result);
    console.log("=== CREDIT SERVICE DEBUG END ===");
    return result;
  } catch (error) {
    console.error("=== CREDIT SERVICE ERROR ===");
    console.error("Okula kredi ekleme hatası:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

// Kredileri sayfalı olarak getirme
export const getCreditsPaginated = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/credits.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Krediler getirilirken hata oluştu");
    }

    // Backend'den gelen format ile frontend'in beklediği format arasında uyumluluk sağla
    return {
      credits: result.data.credits || [],
      lastDoc: result.data.pagination?.current_page || null,
      hasMore: result.data.pagination?.has_more || false,
      totalCount: result.data.pagination?.total_count || 0,
    };
  } catch (error) {
    console.error("Krediler getirme hatası:", error);
    throw error;
  }
};

// Kredi ID ile getirme
export const getCreditById = async (creditId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php?id=${creditId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kredi getirilirken hata oluştu");
    }

    return result.credit;
  } catch (error) {
    console.error("Kredi getirme hatası:", error);
    throw error;
  }
};

// Okul adına göre kredi getirme
export const getCreditBySchoolName = async (schoolName) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/credits.php?okul_adi=${encodeURIComponent(schoolName)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Okul kredisi getirilirken hata oluştu"
      );
    }

    return result.credit;
  } catch (error) {
    console.error("Okul kredisi getirme hatası:", error);
    throw error;
  }
};

// Kredi güncelleme
export const updateCredit = async (creditId, creditData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php?id=${creditId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creditData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kredi güncellenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kredi güncelleme hatası:", error);
    throw error;
  }
};

// Kredi silme
export const deleteCredit = async (creditId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php?id=${creditId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kredi silinirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kredi silme hatası:", error);
    throw error;
  }
};

// Krediyi pasif yapma
export const setCreditPassive = async (creditId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php?id=${creditId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ durum: "pasif" }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kredi pasif yapılırken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kredi pasif yapma hatası:", error);
    throw error;
  }
};

// Krediyi aktif yapma
export const setCreditActive = async (creditId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php?id=${creditId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ durum: "aktif" }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kredi aktif yapılırken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kredi aktif yapma hatası:", error);
    throw error;
  }
};

// Tüm aktif kredileri getirme
export const getAllActiveCredits = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/credits.php?active=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Aktif krediler getirilirken hata oluştu"
      );
    }

    return result.credits;
  } catch (error) {
    console.error("Aktif krediler getirme hatası:", error);
    throw error;
  }
};
