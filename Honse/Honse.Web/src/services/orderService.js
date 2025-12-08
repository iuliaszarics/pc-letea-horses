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

// ========== MOCK DATA ==========

const MOCK_RESTAURANT = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Pizza Palace",
    address: {
        street: "123 Main Street",
        city: "New York",
        postalCode: "10001"
    },
    phone: "+1 (555) 123-4567",
    email: "contact@pizzapalace.com"
};

const MOCK_ORDERS = [
    {
        id: "12345",
        orderNumber: "#ORD-2023-12345",
        customerName: "John Doe",
        customerPhone: "+1 (555) 987-6543",
        customerAddress: "456 Oak Street, New York, NY 10002",
        total: 25.50,
        status: "New",
        timeAgo: "2 minutes ago",
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        items: [
            { id: "1", name: "Margherita Pizza", description: "Extra cheese", quantity: 1, price: 12.99 },
            { id: "2", name: "Coca Cola", description: "", quantity: 2, price: 2.50 }
        ],
        subtotal: 17.99,
        tax: 0.90,
        deliveryFee: 6.61,
        orderDate: new Date(Date.now() - 2 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Credit Card",
        paymentStatus: "Paid"
    },
    {
        id: "12346",
        orderNumber: "#ORD-2023-12346",
        customerName: "Jane Smith",
        customerPhone: "+1 (555) 876-5432",
        customerAddress: "789 Elm Street, New York, NY 10003",
        total: 15.00,
        status: "New",
        timeAgo: "5 minutes ago",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        items: [
            { id: "3", name: "Pepperoni Pizza", description: "", quantity: 1, price: 14.99 }
        ],
        subtotal: 14.99,
        tax: 0.75,
        deliveryFee: 4.26,
        orderDate: new Date(Date.now() - 5 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "PayPal",
        paymentStatus: "Paid"
    },
    {
        id: "12347",
        orderNumber: "#ORD-2023-12347",
        customerName: "Peter Jones",
        customerPhone: "+1 (555) 765-4321",
        customerAddress: "321 Pine Avenue, New York, NY 10004",
        total: 42.75,
        status: "New",
        timeAgo: "1 minute ago",
        createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        items: [
            { id: "4", name: "Hawaiian Pizza", description: "", quantity: 1, price: 13.99 },
            { id: "5", name: "BBQ Chicken Pizza", description: "Extra sauce", quantity: 1, price: 15.99 },
            { id: "6", name: "Garlic Bread", description: "", quantity: 2, price: 4.50 }
        ],
        subtotal: 38.97,
        tax: 1.95,
        deliveryFee: 1.83,
        orderDate: new Date(Date.now() - 1 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 1 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Credit Card",
        paymentStatus: "Paid"
    },
    {
        id: "12340",
        orderNumber: "#ORD-2023-12340",
        customerName: "Mary Jane",
        customerPhone: "+1 (555) 654-3210",
        customerAddress: "654 Maple Drive, New York, NY 10005",
        total: 33.20,
        status: "Preparing",
        timeAgo: "15 minutes ago",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        items: [
            { id: "7", name: "Vegetarian Pizza", description: "", quantity: 1, price: 12.99 },
            { id: "8", name: "Caesar Salad", description: "", quantity: 1, price: 8.99 },
            { id: "9", name: "Sprite", description: "", quantity: 2, price: 2.50 }
        ],
        subtotal: 26.98,
        tax: 1.35,
        deliveryFee: 4.87,
        orderDate: new Date(Date.now() - 15 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending"
    },
    {
        id: "12339",
        orderNumber: "#ORD-2023-12339",
        customerName: "Alex Ray",
        customerPhone: "+1 (555) 543-2109",
        customerAddress: "987 Cedar Lane, New York, NY 10006",
        total: 19.99,
        status: "Preparing",
        timeAgo: "18 minutes ago",
        createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        items: [
            { id: "10", name: "Buffalo Wings", description: "12 pieces", quantity: 1, price: 11.99 },
            { id: "11", name: "Fries", description: "Large", quantity: 1, price: 4.99 }
        ],
        subtotal: 16.98,
        tax: 0.85,
        deliveryFee: 2.16,
        orderDate: new Date(Date.now() - 18 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 18 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Credit Card",
        paymentStatus: "Paid"
    },
    {
        id: "12335",
        orderNumber: "#ORD-2023-12335",
        customerName: "Sarah Connor",
        customerPhone: "+1 (555) 432-1098",
        customerAddress: "147 Birch Road, New York, NY 10007",
        total: 55.00,
        status: "OutForDelivery",
        timeAgo: "25 minutes ago",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        items: [
            { id: "12", name: "Large Meat Lovers Pizza", description: "", quantity: 2, price: 18.99 },
            { id: "13", name: "Mozzarella Sticks", description: "", quantity: 1, price: 7.99 },
            { id: "14", name: "Pepsi", description: "2L bottle", quantity: 1, price: 3.99 }
        ],
        subtotal: 49.96,
        tax: 2.50,
        deliveryFee: 2.54,
        orderDate: new Date(Date.now() - 25 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Credit Card",
        paymentStatus: "Paid"
    },
    {
        id: "12330",
        orderNumber: "#ORD-2023-12330",
        customerName: "Mike Tyson",
        customerPhone: "+1 (555) 321-0987",
        customerAddress: "258 Willow Court, New York, NY 10008",
        total: 88.10,
        status: "OutForDelivery",
        timeAgo: "35 minutes ago",
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        items: [
            { id: "15", name: "Supreme Pizza", description: "Extra large", quantity: 2, price: 21.99 },
            { id: "16", name: "Chicken Wings", description: "24 pieces", quantity: 1, price: 19.99 },
            { id: "17", name: "Onion Rings", description: "", quantity: 1, price: 5.99 },
            { id: "18", name: "Coca Cola", description: "2L bottle", quantity: 2, price: 3.99 }
        ],
        subtotal: 77.94,
        tax: 3.90,
        deliveryFee: 6.26,
        orderDate: new Date(Date.now() - 35 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 35 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Credit Card",
        paymentStatus: "Paid"
    },
    {
        id: "12325",
        orderNumber: "#ORD-2023-12325",
        customerName: "Laura Croft",
        customerPhone: "+1 (555) 210-9876",
        customerAddress: "369 Spruce Street, New York, NY 10009",
        total: 21.50,
        status: "Delivered",
        timeAgo: "1 hour ago",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        items: [
            { id: "19", name: "Greek Salad", description: "", quantity: 1, price: 9.99 },
            { id: "20", name: "Soft Drink", description: "", quantity: 2, price: 2.50 }
        ],
        subtotal: 14.99,
        tax: 0.75,
        deliveryFee: 5.76,
        orderDate: new Date(Date.now() - 60 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 60 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "PayPal",
        paymentStatus: "Paid"
    },
    {
        id: "12320",
        orderNumber: "#ORD-2023-12320",
        customerName: "Bruce Wayne",
        customerPhone: "+1 (555) 109-8765",
        customerAddress: "159 Gotham Avenue, New York, NY 10010",
        total: 67.85,
        status: "Delivered",
        timeAgo: "2 hours ago",
        createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        items: [
            { id: "21", name: "Quattro Formaggi Pizza", description: "", quantity: 1, price: 16.99 },
            { id: "22", name: "Pasta Carbonara", description: "", quantity: 1, price: 14.99 },
            { id: "23", name: "Tiramisu", description: "", quantity: 2, price: 6.99 },
            { id: "24", name: "Red Wine", description: "Bottle", quantity: 1, price: 18.99 }
        ],
        subtotal: 64.95,
        tax: 3.25,
        deliveryFee: -0.35,
        orderDate: new Date(Date.now() - 120 * 60 * 1000).toLocaleDateString(),
        orderTime: new Date(Date.now() - 120 * 60 * 1000).toLocaleTimeString(),
        paymentMethod: "Credit Card",
        paymentStatus: "Paid"
    }
];

// Helper function to simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ========== MOCK API FUNCTIONS ==========

// Get all orders for a restaurant (MOCK)
export async function getAllOrdersAPI(restaurantId) {
    await delay();
    try {
        // Filter orders by restaurant (in real scenario)
        const orders = MOCK_ORDERS;
        return successData({ orders, restaurant: MOCK_RESTAURANT });
    } catch (err) {
        return failure("Failed to fetch orders");
    }
}

// In orderService.js, update getFilteredOrdersAPI
export async function getFilteredOrdersAPI(filters) {
    await delay();
    try {
        console.log("🔍 Filtering orders with:", filters);
        
        let filteredOrders = [...MOCK_ORDERS];

        // Filter by search key (order number or customer name)
        if (filters.searchKey) {
            const searchLower = filters.searchKey.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.orderNumber.toLowerCase().includes(searchLower) ||
                order.customerName.toLowerCase().includes(searchLower)
            );
        }

        // Filter by status
        if (filters.status) {
            filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }

        console.log("✅ Found orders:", filteredOrders.length);
        console.log("📦 Orders data:", filteredOrders);

        return successData({ orders: filteredOrders, restaurant: MOCK_RESTAURANT });
    } catch (err) {
        console.error("❌ Error filtering orders:", err);
        return failure("Failed to fetch orders");
    }
}

// Get order details (MOCK)
export async function getOrderDetailsAPI(restaurantId, orderId) {
    await delay();
    try {
        const order = MOCK_ORDERS.find(o => o.id === orderId);
        
        if (!order) {
            return failure("Order not found");
        }

        // Add customer details in the expected format
        const orderWithDetails = {
            ...order,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress
            }
        };

        return successData(orderWithDetails);
    } catch (err) {
        return failure("Failed to fetch order details");
    }
}

// Process order (update status) (MOCK)
export async function processOrderAPI(orderData) {
    await delay();
    try {
        const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderData.orderId);
        
        if (orderIndex === -1) {
            return failure("Order not found");
        }

        // Update the order status
        MOCK_ORDERS[orderIndex].status = orderData.orderStatus;
        
        return successData({ message: "Order status updated successfully" });
    } catch (err) {
        return failure("Failed to process order");
    }
}

// Create order (MOCK)
export async function createOrderAPI(orderData) {
    await delay();
    try {
        const newOrder = {
            id: Math.random().toString(36).substr(2, 9),
            orderNumber: `#ORD-2023-${Math.floor(Math.random() * 90000) + 10000}`,
            ...orderData,
            status: "New",
            timeAgo: "Just now",
            createdAt: new Date().toISOString()
        };

        MOCK_ORDERS.unshift(newOrder);
        
        return successData(newOrder);
    } catch (err) {
        return failure("Failed to create order");
    }
}

// Add this export at the end of the file
export const MOCK_RESTAURANT_ID = "550e8400-e29b-41d4-a716-446655440001";

// ========== REAL API FUNCTIONS ==========

/*
// Get all orders for a restaurant
export async function getAllOrdersAPI(restaurantId) {
    try {
        const res = await api.get(`/api/orders/all/${restaurantId}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to fetch orders"));
    }
}

// Get filtered orders
export async function getFilteredOrdersAPI(filters) {
    try {
        const params = new URLSearchParams();
        if (filters.restaurantId) params.append("RestaurantId", filters.restaurantId);
        if (filters.status) params.append("Status", filters.status);
        if (filters.searchKey) params.append("SearchKey", filters.searchKey);
        if (filters.pageSize) params.append("PageSize", filters.pageSize);
        if (filters.pageNumber) params.append("PageNumber", filters.pageNumber);

        const res = await api.get(`/api/orders?${params.toString()}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to fetch orders"));
    }
}

// Get order details
export async function getOrderDetailsAPI(restaurantId, orderId) {
    try {
        const res = await api.get(`/api/orders/details/${restaurantId}/${orderId}`);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to fetch order details"));
    }
}

// Process order (update status)
export async function processOrderAPI(orderData) {
    try {
        const res = await api.post("/api/orders/process", orderData);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to process order"));
    }
}

// Create order
export async function createOrderAPI(orderData) {
    try {
        const res = await api.post("/api/orders", orderData);
        return successData(res.data);
    } catch (err) {
        return failure(parseError(err, "Failed to create order"));
    }
}
*/