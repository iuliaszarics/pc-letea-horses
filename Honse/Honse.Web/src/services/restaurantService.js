import axios from "axios";

const RAW_BASE = process.env.REACT_APP_API_URL || "https://localhost:2000";
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

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

export async function getPublicRestaurantsAPI({
  searchKey,
  cuisineType,
  city,
  isOpen,
  minRating,
  pageSize = 12,
  pageNumber = 1,
}) {
  try {
    const params = new URLSearchParams();
    if (searchKey) params.append("SearchKey", searchKey);
    if (cuisineType) params.append("CuisineType", cuisineType);
    if (city) params.append("City", city);
    if (isOpen !== undefined) params.append("IsOpen", isOpen);
    if (minRating) params.append("MinRating", minRating);
    params.append("PageSize", pageSize);
    params.append("PageNumber", pageNumber);

    const res = await publicApi.get(
      `/api/public/restaurants?${params.toString()}`
    );

    return {
      succeeded: true,
      restaurants: res.data.result,
      totalCount: res.data.totalCount,
      pageNumber: res.data.pageNumber,
    };
  } catch (err) {
    return failure(parseError(err, "Failed to fetch restaurants"));
  }
}

export async function getPublicRestaurantsMenu(restaurantId) {
  try {
    const res = await publicApi.get(
      `/api/public/restaurants/${restaurantId}/menu`
    );

    return {
      succeeded: true,
      restaurant: res.data,
    };
  } catch (err) {
    return failure(parseError(err, "Failed to fetch restaurant menu"));
  }
}

export async function getRestaurantsAPI({
  searchKey,
  cuisineType,
  city,
  isEnabled,
  minRating,
  pageSize = 10,
  pageNumber = 1,
}) {
  try {
    const params = new URLSearchParams();
    if (searchKey) params.append("SearchKey", searchKey);
    if (cuisineType) params.append("CuisineType", cuisineType);
    if (city) params.append("City", city);
    if (isEnabled !== undefined) params.append("IsEnabled", isEnabled);
    if (minRating) params.append("MinRating", minRating);
    params.append("PageSize", pageSize);
    params.append("PageNumber", pageNumber);

    const res = await api.get(`/api/restaurants?${params.toString()}`);

    return {
      succeeded: true,
      restaurants: res.data.result,
      totalCount: res.data.totalCount,
      pageNumber: res.data.pageNumber,
    };
  } catch (err) {
    return failure(parseError(err, "Failed to fetch restaurants"));
  }
}

export async function getAllRestaurantsAPI() {
  try {
    const res = await api.get("/api/restaurants/all");
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to fetch all restaurants"));
  }
}

export async function getRestaurantByIdAPI(id) {
  try {
    const res = await api.get(`/api/restaurants/${id}`);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to fetch restaurant"));
  }
}


export async function addRestaurantAPI(restaurant) {
  try {
    const res = await api.post("/api/restaurants", restaurant);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to add restaurant"));
  }
}


export async function updateRestaurantAPI(id, restaurant) {
  try {
    const res = await api.put(`/api/restaurants/${id}`, restaurant);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to update restaurant"));
  }
}

export async function deleteRestaurantAPI(id) {
    try {
        const res = await api.delete(`/api/restaurants/${id}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to delete restaurant"));
    }
}

export async function getAllCategoriesAPI() {
    try {
        const res = await api.get(`/api/ProductCategory/all`);
        return { succeeded: true, data: res.data };
    } catch (err) {
        return failure(parseError(err, "Failed to fetch categories."));
    }
}

export async function getCategoriesByRestaurantAPI(restaurantId) {
    try {
        const res = await api.get(`/api/ProductCategory/restaurant/${restaurantId}`);
        return { succeeded: true, data: res.data };
    } catch (err) {
        return failure(parseError(err, "Failed to fetch restaurant categories."));
    }
}