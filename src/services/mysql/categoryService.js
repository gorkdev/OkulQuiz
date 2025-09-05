const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";

export const uploadFile = async (file, type, categoryId = 'temp') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('categoryId', categoryId);

    const response = await fetch(`${API_BASE_URL}/upload.php`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Dosya yüklenirken hata oluştu');
    }

    return result.data;
  } catch (error) {
    console.error('Dosya upload hatası:', error);
    throw error;
  }
};

// Kategori ekleme
export const addCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kategori eklenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kategori ekleme hatası:", error);
    throw error;
  }
};

// Kategori adının alınmış olup olmadığını kontrol etme
export const isCategoryNameTaken = async (categoryName, excludeId = null) => {
  try {
    const params = new URLSearchParams({ name: categoryName });
    if (excludeId) {
      params.append("exclude_id", excludeId);
    }

    const response = await fetch(`${API_BASE_URL}/categories.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori adı kontrol edilirken hata oluştu"
      );
    }

    return result.exists;
  } catch (error) {
    console.error("Kategori adı kontrol hatası:", error);
    throw error;
  }
};

// Kategorileri sayfalı olarak getirme
export const getCategoriesPaginated = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/categories.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kategoriler getirilirken hata oluştu");
    }

    // Normalize: backend data sarmalını düzleştir
    const data = result?.data || result;
    return {
      categories: data?.categories || [],
      lastDoc: data?.pagination?.current_page || null,
      hasMore: data?.pagination?.has_more || false,
      totalCount: data?.pagination?.total_count || 0,
    };
  } catch (error) {
    console.error("Kategoriler getirme hatası:", error);
    throw error;
  }
};

// Tüm kategorileri sayfalı olarak getirme (aktif/pasif dahil)
export const getAllCategoriesPaginated = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
      all: "true",
    });

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_BASE_URL}/categories.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kategoriler getirilirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kategoriler getirme hatası:", error);
    throw error;
  }
};

// Kategori ID ile getirme
export const getCategoryById = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories.php?id=${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kategori getirilirken hata oluştu");
    }

    return result.category;
  } catch (error) {
    console.error("Kategori getirme hatası:", error);
    throw error;
  }
};

// Kategori güncelleme
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories.php?id=${categoryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kategori güncellenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kategori güncelleme hatası:", error);
    throw error;
  }
};

// Kategori silme
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories.php?id=${categoryId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Kategori silinirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Kategori silme hatası:", error);
    throw error;
  }
};

// Kategoriyi pasif yapma
export const setCategoryPassive = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories.php?id=${categoryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: false }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori pasif yapılırken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Kategori pasif yapma hatası:", error);
    throw error;
  }
};

// Kategoriyi aktif yapma
export const setCategoryActive = async (categoryId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories.php?id=${categoryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: true }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori aktif yapılırken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Kategori aktif yapma hatası:", error);
    throw error;
  }
};

// Kategori adına göre soru sayısını getirme
export const getQuestionCountByCategoryName = async (categoryName) => {
  try {
    const params = new URLSearchParams({ category_name: categoryName });

    const response = await fetch(`${API_BASE_URL}/categories.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori soru sayısı getirilirken hata oluştu"
      );
    }

    const data = result?.data || result;
    return data?.question_count || 0;
  } catch (error) {
    console.error("Kategori soru sayısı getirme hatası:", error);
    return 0;
  }
};

// Kategori ID'sine göre soru sayısını getirme (performans için tercih edilir)
export const getQuestionCountByCategoryId = async (categoryId) => {
  try {
    const params = new URLSearchParams({ category_id: String(categoryId) });

    const response = await fetch(`${API_BASE_URL}/categories.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kategori soru sayısı getirilirken hata oluştu"
      );
    }

    const data = result?.data || result;
    return data?.question_count || 0;
  } catch (error) {
    console.error("Kategori (ID) soru sayısı getirme hatası:", error);
    return 0;
  }
};

// Tüm aktif kategorileri getirme
export const getAllActiveCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories.php?active=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Aktif kategoriler getirilirken hata oluştu"
      );
    }

    return result.categories;
  } catch (error) {
    console.error("Aktif kategoriler getirme hatası:", error);
    throw error;
  }
};
