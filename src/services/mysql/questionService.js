const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";

// Soru ekleme
export const addQuestion = async (questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Soru eklenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Soru ekleme hatası:", error);
    throw error;
  }
};

// Soruları sayfalı olarak getirme
export const getQuestionsPaginated = async (
  page = 1,
  limit = 10,
  search = "",
  categoryId = null
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (categoryId) {
      params.append("category_id", categoryId);
    }

    const response = await fetch(`${API_BASE_URL}/questions.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Sorular getirilirken hata oluştu");
    }

    // Frontend'in beklediği formata dönüştür
    return {
      questions: result.data?.questions || result.questions || [],
      lastDoc: result.data?.pagination?.current_page || null,
      hasMore: result.data?.pagination?.has_more || false,
      totalCount: result.data?.pagination?.total_count || 0,
    };
  } catch (error) {
    console.error("Sorular getirme hatası:", error);
    throw error;
  }
};

// Soru arama
export const searchQuestions = async (searchTerm, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/questions.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Soru arama yapılırken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Soru arama hatası:", error);
    throw error;
  }
};

// Soru ID ile getirme
export const getQuestionById = async (questionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions.php?id=${questionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Soru getirilirken hata oluştu");
    }

    return result.question;
  } catch (error) {
    console.error("Soru getirme hatası:", error);
    throw error;
  }
};

// Soru güncelleme
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions.php?id=${questionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Soru güncellenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Soru güncelleme hatası:", error);
    throw error;
  }
};

// Soru silme
export const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions.php?id=${questionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Soru silinirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Soru silme hatası:", error);
    throw error;
  }
};

// Kategoriye göre soruları getirme
export const getQuestionsByCategory = async (categoryId, limit = 10) => {
  try {
    const params = new URLSearchParams({
      category_id: categoryId,
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/questions.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori soruları getirilirken hata oluştu"
      );
    }

    return result.questions;
  } catch (error) {
    console.error("Kategori soruları getirme hatası:", error);
    throw error;
  }
};

// Rastgele sorular getirme
export const getRandomQuestions = async (categoryId = null, count = 10) => {
  try {
    const params = new URLSearchParams({
      random: "true",
      count: count.toString(),
    });

    if (categoryId) {
      params.append("category_id", categoryId);
    }

    const response = await fetch(`${API_BASE_URL}/questions.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Rastgele sorular getirilirken hata oluştu"
      );
    }

    return result.questions;
  } catch (error) {
    console.error("Rastgele sorular getirme hatası:", error);
    throw error;
  }
};

// Kategoriye göre sayfalı sorular getirme
export const getQuestionsByCategoryPaginated = async (
  categoryId,
  page = 1,
  limit = 10
) => {
  try {
    const params = new URLSearchParams({
      category_id: categoryId,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/questions.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori soruları getirilirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Kategori soruları getirme hatası:", error);
    throw error;
  }
};

// ID listesine göre sorular getirme
export const getQuestionsByIds = async (questionIds) => {
  try {
    const params = new URLSearchParams({
      ids: questionIds.join(","),
    });

    const response = await fetch(`${API_BASE_URL}/questions.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Sorular getirilirken hata oluştu");
    }

    return result.questions;
  } catch (error) {
    console.error("Sorular getirme hatası:", error);
    throw error;
  }
};

// Soru oluşturma (createQuestion alias'ı)
export const createQuestion = async (questionData) => {
  return addQuestion(questionData);
};

// Dosya yükleme (eğer gerekirse)
export const uploadQuestionFile = async (file, questionId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("question_id", questionId);

    const response = await fetch(`${API_BASE_URL}/questions.php?upload=true`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Dosya yüklenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    throw error;
  }
};

// Multipart ile yeni soru oluşturma (dosya + alanlar)
export const createQuestionWithFiles = async (formData) => {
  const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";
  try {
    const response = await fetch(`${API_BASE_URL}/questions.php`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Soru eklenirken hata oluştu");
    }
    return result;
  } catch (error) {
    console.error("Soru ekleme (multipart) hatası:", error);
    throw error;
  }
};
