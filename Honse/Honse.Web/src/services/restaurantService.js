import axios from "axios";

const RAW_BASE = process.env.REACT_APP_API_URL || "https://localhost:2000";
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

// Create a separate axios instance for public endpoints (no auth required)
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Keep the authenticated API for private endpoints
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

// PUBLIC ENDPOINTS - No authentication required

// Get all restaurants with filtering (PUBLIC)
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

// AUTHENTICATED ENDPOINTS - Require authentication

// Get all restaurants with filtering (AUTHENTICATED - for restaurant owner)
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

// Get all restaurants without pagination (AUTHENTICATED)
export async function getAllRestaurantsAPI() {
  try {
    const res = await api.get("/api/restaurants/all");
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to fetch all restaurants"));
  }
}

// Get restaurant by ID (AUTHENTICATED)
export async function getRestaurantByIdAPI(id) {
  try {
    const res = await api.get(`/api/restaurants/${id}`);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to fetch restaurant"));
  }
}

// Add new restaurant (AUTHENTICATED)
export async function addRestaurantAPI(restaurant) {
  try {
    const res = await api.post("/api/restaurants", restaurant);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to add restaurant"));
  }
}

// Update restaurant (AUTHENTICATED)
export async function updateRestaurantAPI(id, restaurant) {
  try {
    const res = await api.put(`/api/restaurants/${id}`, restaurant);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to update restaurant"));
  }
}

// Delete restaurant (AUTHENTICATED)
export async function deleteRestaurantAPI(id) {
  try {
    const res = await api.delete(`/api/restaurants/${id}`);
    return successData(res.data);
  } catch (err) {
    return failure(parseError(err, "Failed to delete restaurant"));
  }
}
