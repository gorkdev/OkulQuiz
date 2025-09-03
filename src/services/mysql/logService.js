const API_BASE_URL = "http://localhost/OkulQuiz/backend/api";

// Log ekleme
export const addLog = async (logData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Log eklenirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Log ekleme hatası:", error);
    throw error;
  }
};

// Logları sayfalı olarak getirme
export const getLogsPaginated = async (
  page = 1,
  limit = 10,
  search = "",
  logType = null
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (logType) {
      params.append("type", logType);
    }

    const response = await fetch(`${API_BASE_URL}/logs.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Loglar getirilirken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Loglar getirme hatası:", error);
    throw error;
  }
};

// Log ID ile getirme
export const getLogById = async (logId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs.php?id=${logId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Log getirilirken hata oluştu");
    }

    return result.log;
  } catch (error) {
    console.error("Log getirme hatası:", error);
    throw error;
  }
};

// Tarih aralığına göre logları getirme
export const getLogsByDateRange = async (
  startDate,
  endDate,
  page = 1,
  limit = 10
) => {
  try {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/logs.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Tarih aralığı logları getirilirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Tarih aralığı logları getirme hatası:", error);
    throw error;
  }
};

// Log arama
export const searchLogs = async (searchTerm, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/logs.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Log arama yapılırken hata oluştu");
    }

    return result;
  } catch (error) {
    console.error("Log arama hatası:", error);
    throw error;
  }
};

// Eski logları temizleme
export const cleanOldLogs = async (daysOld = 30) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/logs.php?clean=true&days=${daysOld}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Eski loglar temizlenirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Eski loglar temizleme hatası:", error);
    throw error;
  }
};

// Log istatistiklerini getirme
export const getLogStatistics = async (period = "daily") => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/logs.php?stats=true&period=${period}`,
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
        result.message || "Log istatistikleri getirilirken hata oluştu"
      );
    }

    return result.statistics;
  } catch (error) {
    console.error("Log istatistikleri getirme hatası:", error);
    throw error;
  }
};

// Log tipine göre logları getirme
export const getLogsByType = async (logType, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      type: logType,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/logs.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Log tipi logları getirilirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Log tipi logları getirme hatası:", error);
    throw error;
  }
};

// Logları getirme (fetchLogs alias'ı - Firebase uyumluluğu için)
export const fetchLogs = async (options = {}) => {
  const { pageSize = 10, search = "", lastDocSnap = null } = options;

  // Firebase'den gelen lastDocSnap parametresini sayfa numarasına çevir
  let page = 1;
  if (lastDocSnap) {
    // lastDocSnap varsa, bir sonraki sayfayı al
    page = lastDocSnap + 1;
  }

  try {
    const result = await getLogsPaginated(page, pageSize, search);

    // Backend'in döndürdüğü format ile uyumlu hale getir
    return {
      logs: result.logs || [],
      hasMore: result.pagination?.has_more || false,
      lastDoc: result.pagination?.current_page || null,
    };
  } catch (error) {
    console.error("fetchLogs hatası:", error);
    throw error;
  }
};

// Kullanıcıya göre logları getirme
export const getLogsByUser = async (userId, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/logs.php?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Kullanıcı logları getirilirken hata oluştu"
      );
    }

    return result;
  } catch (error) {
    console.error("Kullanıcı logları getirme hatası:", error);
    throw error;
  }
};
