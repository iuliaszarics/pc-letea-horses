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
    Cancelled: -1
};

export const getStatusLabel = (status) => {
    const statusMap = {
        0: "New",
        1: "Preparing",
        2: "Out for Delivery",
        3: "Delivered",
        [-1]: "Cancelled"
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
        const order = MOCK_ORDERS.find(o => o.id === orderId);
       // const order = await api.get(`/api/public/orders/${orderId}`);
        if (!order) {
            return failure("Order not found");
        }
        return successData(order);
    } catch (err) {
        return failure(parseError(err, "Failed to fetch order details"));
    }
}

export async function cancelOrderAPI(orderId) {
    try { 
        //const res = await api.post(`/api/public/orders/cancel/${orderId}`);
        //return successData(res.data);
        return successData();
    } catch (err) {
        return failure(parseError(err, "Failed to cancel order"));
    }
}

export async function confirmOrderAPI(id) {
    try {
        await new Promise(resolve => setTimeout(resolve, 10000));
       // const res = await api.post(`/api/public/confirm/${id}`);
         const order = MOCK_ORDERS.find(o => o.id === id);
          if (!order) {
            return failure("On no! Order confirmation link expired");
        }
        return successData();
    } catch (err) {
        return failure(parseError(err, "Failed to confirm order"));
    }
}

const MOCK_ORDERS = [
    {
        id: "order-1",
        orderNo: "#ORD-2023-12345",
        restaurantId: "123",
        orderStatus: OrderStatus.Delivery,
        clientName: "John Doe",
        clientEmail: "john_doe2gmail.com",
        deliveryAddress: "456 Oak Street, New York, NY 10002",
        products: [
            { id: "1", name: "Margherita Pizza", quantity: 1, price: 12.99, vat:9, total:12.99, imgUrl: 'https://i.pinimg.com/736x/68/ef/90/68ef9032fae3d204d6f5bb72221d9b6e.jpg' },
            { id: "1", name: "Cola", quantity: 1, price: 5.99, vat:9, total:5.99, imgUrl: 'https://i.pinimg.com/736x/68/ef/90/68ef9032fae3d204d6f5bb72221d9b6e.jpg' },
        ],
        deliveryTime: "2025-12-11T16:45:00",
        timeStamp: "2025-12-11T16:45:00",
        preparationTime: "2025-12-11T16:45:00",
        total: 70,
        statusHistory: [
            {status: OrderStatus.New , timeStamp: "2025-12-10T16:01:00" , notes: ""},
            {status: OrderStatus.Accepted , timeStamp: "2025-12-10T16:12:00" , notes: ""},
            {status: OrderStatus.Delivery , timeStamp: "2025-12-10T16:37:00" , notes: ""},
        ],
    },
    {
        id: "order-2",
        orderNo: "#ORD-2023-12346",
        restaurantId: "321",
        orderStatus: OrderStatus.Accepted,
        clientName: "Jane Smith",
        clientEmail: "janeSmith@gmail.com",
         deliveryAddress: "123 Main St, New York, NY 10001",
        products: [
            { id: "1", name: "Burger", quantity: 2, price: 15.00, total: 30, imgUrl: 'https://i.pinimg.com/736x/68/ef/90/68ef9032fae3d204d6f5bb72221d9b6e.jpg' },
             { id: "1", name: "Pasta", quantity: 1, price: 42.75, total: 42.75, imgUrl: 'https://i.pinimg.com/736x/68/ef/90/68ef9032fae3d204d6f5bb72221d9b6e.jpg',  }
        ],
        total: 15.00,
        deliveryTime: "2025-12-10T16:45:00",
        preparationTime: "2025-12-10T16:45:00",
        timeStamp: "2025-12-09T16:45:00",
        statusHistory: [
            {status: OrderStatus.New , timeStamp: "2025-12-10T16:22:00" , notes: ""},
            {status: OrderStatus.Accepted , timeStamp: "2025-12-10T16:31:00" , notes: ""},
        ],
    },
];


