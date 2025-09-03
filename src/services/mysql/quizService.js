const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";

// Quiz'leri getirme
export const getQuizzes = async (page = 1, limit = 10, search = "") => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/quizzes.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz'ler getirilirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Quiz'ler getirme hatası:", error);
    throw error;
  }
};

// Quizleri sayfalı olarak getirme (Quizzes sayfası için)
export const getQuizzesPaginated = async (
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

    const response = await fetch(`${API_BASE_URL}/quizzes.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quizler getirilirken hata oluştu");
    }

    // Backend'den gelen format ile frontend'in beklediği format arasında uyumluluk sağla
    return {
      quizzes: result.data.quizzes || [],
      lastDoc: result.data.pagination?.current_page || null,
      hasMore: result.data.pagination?.has_more || false,
      totalCount: result.data.pagination?.total_count || 0,
    };
  } catch (error) {
    console.error("Quizler getirme hatası:", error);
    throw error;
  }
};

// Quiz ekleme
export const addQuiz = async (quizData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz eklenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Quiz ekleme hatası:", error);
    throw error;
  }
};

// Quiz ID ile getirme
export const getQuizById = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes.php?id=${quizId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz getirilirken hata oluştu");
    }

    return result.quiz;
  } catch (error) {
    console.error("Quiz getirme hatası:", error);
    throw error;
  }
};

// Quiz güncelleme
export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes.php?id=${quizId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz güncellenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Quiz güncelleme hatası:", error);
    throw error;
  }
};

// Quiz silme
export const deleteQuiz = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes.php?id=${quizId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz silinirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Quiz silme hatası:", error);
    throw error;
  }
};

// Quiz adının alınmış olup olmadığını kontrol etme
export const isQuizNameTaken = async (quizName, excludeId = null) => {
  try {
    const params = new URLSearchParams({ name: quizName });
    if (excludeId) {
      params.append("exclude_id", excludeId);
    }

    const response = await fetch(`${API_BASE_URL}/quizzes.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Quiz adı kontrol edilirken hata oluştu"
      );
    }

    return result.exists;
  } catch (error) {
    console.error("Quiz adı kontrol hatası:", error);
    throw error;
  }
};

// Quiz kategori ilişkilerini ekleme
export const addQuizCategoryRelations = async (quizId, categoryIds) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes.php?relations=categories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quizId,
          category_ids: categoryIds,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Quiz kategori ilişkileri eklenirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Quiz kategori ilişkileri ekleme hatası:", error);
    throw error;
  }
};

// Quiz soru ilişkilerini ekleme
export const addQuizQuestionRelations = async (quizId, questionIds) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes.php?relations=questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quizId,
          question_ids: questionIds,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Quiz soru ilişkileri eklenirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Quiz soru ilişkileri ekleme hatası:", error);
    throw error;
  }
};

// Quiz kategori ilişkilerini güncelleme
export const updateQuizCategoryRelations = async (quizId, categoryIds) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes.php?relations=categories&id=${quizId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_ids: categoryIds,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Quiz kategori ilişkileri güncellenirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Quiz kategori ilişkileri güncelleme hatası:", error);
    throw error;
  }
};

// Quiz soru ilişkilerini güncelleme
export const updateQuizQuestionRelations = async (quizId, questionIds) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes.php?relations=questions&id=${quizId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_ids: questionIds,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Quiz soru ilişkileri güncellenirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Quiz soru ilişkileri güncelleme hatası:", error);
    throw error;
  }
};

// Quiz'in kategorilerini getirme
export const getQuizCategories = async (quizId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes.php?id=${quizId}&categories=true`,
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
        result.message || "Quiz kategorileri getirilirken hata oluştu"
      );
    }

    return result.categories;
  } catch (error) {
    console.error("Quiz kategorileri getirme hatası:", error);
    throw error;
  }
};

// Quiz'in sorularını getirme
export const getQuizQuestions = async (quizId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes.php?id=${quizId}&questions=true`,
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
        result.message || "Quiz soruları getirilirken hata oluştu"
      );
    }

    return result.questions;
  } catch (error) {
    console.error("Quiz soruları getirme hatası:", error);
    throw error;
  }
};

// Quiz'i pasif yapma
export const setQuizPassive = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes.php?id=${quizId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ durum: "pasif" }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz pasif yapılırken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Quiz pasif yapma hatası:", error);
    throw error;
  }
};

// Quiz'i aktif yapma
export const setQuizActive = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes.php?id=${quizId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ durum: "aktif" }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Quiz aktif yapılırken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Quiz aktif yapma hatası:", error);
    throw error;
  }
};
