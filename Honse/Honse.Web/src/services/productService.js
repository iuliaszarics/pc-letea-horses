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

export async function getProductsAPI({

  userId,
  restaurantId,
  categoryId,
  isActive,       
  searchKey,
  minPrice,
  maxPrice,
  pageSize,
  pageNumber,
}) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("UserId", userId);
    if(restaurantId) params.append("RestaurantId", restaurantId);
    if (categoryId) params.append("CategoryId", categoryId);
    if (isActive !== undefined) params.append("IsEnabled", isActive); 
    if(minPrice) params.append("MinPrice", minPrice);
    if(maxPrice) params.append("MaxPrice", maxPrice);
    if (searchKey) params.append("SearchKey", searchKey);
    params.append("PageSize", pageSize);
    params.append("PageNumber", pageNumber);

    const res = await api.get(`/api/products?${params.toString()}`);
    
    return {
      succeeded: true,
      products: res.data.result,
      totalCount: res.data.totalCount,
      pageNumber: res.data.pageNumber,
    };
  } catch (err) {
    return { succeeded: false, errorMessage: parseError(err, "Failed to fetch products") };
  }
}

export async function addProductAPI(product) {
    try {
        const res = await api.post("/api/products", product);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to add product."));
    }
}

export async function updateProductAPI( product) {
    try {
        const res = await api.put(`/api/products`, product);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to update product."));
    }
}

export async function deleteProductAPI(id) {
    try {
        const res = await api.delete(`/api/products/${id}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to delete product."));
    }

    
}

export async function getProductByIdAPI(id) {
  try {
    const res = await api.get(`/api/products/${id}`);
    return successData(res.data); 
  } catch (err) {
    return failure(parseError(err, "Failed to fetch product."));
  }
}

export async function getAllCategoriesAPI(restaurantId) {
  try {
    const res = await api.get(`/api/ProductCategory/restaurant/${restaurantId}`);
    return { succeeded: true, data: res.data };
  } catch (err) {
    return { succeeded: false, errorMessage: parseError(err, "Failed to fetch categories.") };
  }
  //    return {
  //   succeeded: true,
  //   data: [
  //     {
  //       id: "4f2b8864-90e5-433c-7aa3-08de1a1833ff",
  //       name: "Category1"
  //     },
  //     {
  //       id: "4f2b8864-90e5-433c-7aa3-08de1a1833aa", // optional 2nd dummy category
  //       name: "Category2"
  //     }
  //   ]
  // };
}

export async function getRestaurantsByUserAPI(userId) {
  try {
    const params = new URLSearchParams();
    params.append("UserId", userId);
    params.append("PageSize", 50); 
    params.append("PageNumber", 1);

    const res = await api.get(`/api/restaurants?${params.toString()}`);
    const restaurants = res.data.result || [];

    const formatted = restaurants.map(r => ({
      id: r.id,
      name: r.name,
    }));

    return successData(formatted);

  } catch (err) {
    return failure(parseError(err, "Failed to fetch restaurants"));
  }
}
