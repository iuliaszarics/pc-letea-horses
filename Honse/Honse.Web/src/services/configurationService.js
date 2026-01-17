import axios from "axios";

const RAW_BASE = process.env.REACT_APP_API_URL || "https://localhost:2000";
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function failure(message) {
  return { succeeded: false, errorMessage: message || "Unexpected error." };
}

export function parseError(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.errorMessage) return data.errorMessage;
  if (data?.message) return data.message;
  return fallback;
}

function successData(data, extra = {}) {
  return { succeeded: true, data, ...extra };
}

export async function getConfigurationsAPI({ userId, searchKey = "", pageNumber = 1, pageSize = 10 }) {
  try {
    const res = await api.get("/api/configurations");
    let items = Array.isArray(res.data) ? res.data : [];

    if (userId) {
      items = items.filter((c) => c.userId === userId);
    }

    if (searchKey) {
      const sk = searchKey.toLowerCase();
      items = items.filter((c) => (c.name || "").toLowerCase().includes(sk));
    }

    const totalCount = items.length;
    const startIndex = Math.max(0, (pageNumber - 1) * pageSize);
    const paginated = items.slice(startIndex, startIndex + pageSize);

    return successData(paginated, {
      configurations: paginated,
      totalCount,
      pageNumber,
    });
  } catch (err) {
    return failure(parseError(err, "Failed to load configurations"));
  }
}

export async function getConfigurationByIdAPI(id) {
  try {
    const res = await api.get("/api/configurations");
    const configurations = Array.isArray(res.data) ? res.data : [];
    const config = configurations.find((c) => String(c.id) === String(id));
    
    if (!config) {
      return failure("Configuration not found");
    }
    
    return successData(config);
  } catch (err) {
    return failure(parseError(err, "Failed to load configuration"));
  }
}

export async function getAllCategoriesAPI() {
  try {
    const response = await api.get("/api/productCategory/all");
    return successData(response.data);
  } catch (err) {
    const errorMsg = parseError(err, "Failed to load categories");
    return failure(errorMsg);
  }
}

export async function getCategoriesByConfigurationAPI(configurationId) {
  try {
    const [configRes, catsRes] = await Promise.all([
      api.get(`/api/configurations/${configurationId}`),
      api.get("/api/productCategory/all"),
    ]);

    const config = configRes.data;
    const allCats = Array.isArray(catsRes.data) ? catsRes.data : [];
    const selected = allCats.filter((cat) => config?.categoryIds?.includes(cat.id));

    return successData(selected);
  } catch (err) {
    return failure(parseError(err, "Failed to load configuration categories"));
  }
}


export async function getAllConfigurationsAPI() {
  try {
    const res = await api.get("/api/configurations");
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to load configurations"));
  }
}

export async function addConfigurationAPI(payload) {
  try {
    const res = await api.post("/api/configurations", payload);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to add configuration"));
  }
}

export async function updateConfigurationAPI(id, payload) {
  try {
    const res = await api.put(`/api/configurations/${id}`, payload);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to update configuration"));
  }
}

export async function deleteConfigurationAPI(id) {
  try {
    const res = await api.delete(`/api/configurations/${id}`);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to delete configuration"));
  }
}
