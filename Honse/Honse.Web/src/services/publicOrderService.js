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

export const OrderStatus = {
    New: 0,
    Accepted: 1,
    Delivery: 2,
    Finished: 3,
    Cancelled: 4
};

export const getStatusLabel = (status) => {
    const statusMap = {
        0: "New",
        1: "Preparing",
        2: "Out for Delivery",
        3: "Delivered",
        [4]: "Cancelled"
    };
    return statusMap[status] || "Unknown";
};


export const STATUS_INFO = {
    [OrderStatus.New]: {
        label: "Order Confirmed",
        icon: "receipt_long"
    },
    [OrderStatus.Accepted]: {
        label: "Your order is being prepared",
        icon: "restaurant_menu"
    },
    [OrderStatus.Delivery]: {
        label: "Order picked up for delivery",
        icon: "local_shipping"
    },
    [OrderStatus.Finished]: {
        label: "Delivered",
        icon: "done_all"
    },
    [OrderStatus.Cancelled]: {
        label: "Cancelled",
        icon: "cancel"
    }
};


export async function getOrderDetailsAPI(orderId) {
    try {
        const res = await api.get(`/api/public/orders/${orderId}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to fetch order details"));
    }
}

export async function cancelOrderAPI(orderId) {
    try { 
        const res = await api.post(`/api/public/orders/cancel/${orderId}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to cancel order"));
    }
}

export async function confirmOrderAPI(id) {
    try {
        const res = await api.post(`/api/public/orders/confirm/${id}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to confirm order"));
    }
}

// Place an order (creates confirmation token and sends email)
export async function placeOrderAPI(payload) {
    try {
        const res = await api.post(`/api/public/orders/place`, payload);
        // backend returns { tokenId, message }
        return successData(res.data, { tokenId: res.data?.tokenId });
    } catch (err) {
        return failure(parseError(err, "Failed to place order"));
    }
}

// Validate order before placing (optional step)
export async function validateOrderAPI(payload) {
    try {
        const res = await api.post(`/api/public/orders/validate`, payload);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to validate order"));
    }
}


