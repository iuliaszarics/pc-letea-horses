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

// Order Status Enum Mapping (matches backend)
export const OrderStatus = {
    New: 0,
    Accepted: 1,
    Delivery: 2,
    Finished: 3,
    Cancelled: -1
};

// Helper functions for status
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

export const getStatusColor = (status) => {
    const colorMap = {
        0: "#3b82f6",      // New - Blue
        1: "#f59e0b",      // Preparing - Orange
        2: "#8b5cf6",      // Out for Delivery - Purple
        3: "#10b981",      // Delivered - Green
        [-1]: "#ef4444"    // Cancelled - Red
    };
    return colorMap[status] || "#6b7280";
};

export const getNextStatus = (currentStatus) => {
    const statusFlow = {
        [OrderStatus.New]: { next: OrderStatus.Accepted, label: "Accept" },
        [OrderStatus.Accepted]: { next: OrderStatus.Delivery, label: "Ready for Delivery" },
        [OrderStatus.Delivery]: { next: OrderStatus.Finished, label: "Mark as Delivered" },
        [OrderStatus.Finished]: null,
        [OrderStatus.Cancelled]: null
    };
    return statusFlow[currentStatus];
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get user phone number by user ID
 * @param {string} userId - User GUID
 * @returns {Promise<string>} Phone number or empty string
 */
export async function getUserPhoneNumber(userId) {
    try {
        const res = await api.get(`/api/users/${userId}`);
        return res.data?.phoneNumber || res.data?.phone || "";
    } catch (err) {
        console.error("Failed to fetch user phone:", err);
        return "";
    }
}

/**
 * Get product details by product ID
 * @param {string} productId - Product GUID
 * @returns {Promise<Object>} Product details with name, price, image
 */
export async function getProductDetails(productId) {
    try {
        console.log(`🔍 Fetching product details for: ${productId}`);
        console.log(`🔑 Auth token:`, localStorage.getItem('token')?.substring(0, 20) + '...');
        
        const res = await api.get(`/api/products/${productId}`);
        console.log(`✅ Product fetched:`, res.data);
        
        const product = res.data;
        
        return {
            id: product.id,
            name: product.name || "Unknown Product",
            price: product.price || 0,
            image: product.image || "",
            vat: product.vat || product.VAT || 0
        };
    } catch (err) {
        console.error(`❌ Failed to fetch product ${productId}:`, err);
        console.error(`❌ Error status:`, err.response?.status);
        console.error(`❌ Error message:`, err.response?.data);
        console.error(`❌ Request headers:`, err.config?.headers);
        
        return {
            id: productId,
            name: "Product not found",
            price: 0,
            image: "",
            vat: 0
        };
    }
}

/**
 * Get multiple products by their IDs using filter endpoint (batch fetch)
 * @param {Array<string>} productIds - Array of product GUIDs
 * @returns {Promise<Map>} Map of productId -> product details
 */
export async function getProductsByIds(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return new Map();
    }

    try {
        console.log(`🔍 Fetching ${productIds.length} products in batch`);
        
        // We'll fetch products one by one BUT using the products list endpoint
        // This works because it checks UserId which you now have matching
        const productPromises = productIds.map(async (productId) => {
            try {
                // Use the filter endpoint with specific product ID search
                // This is the same endpoint Menu Management uses!
                const params = new URLSearchParams();
                params.append("PageSize", 1);
                params.append("PageNumber", 1);
                
                const res = await api.get(`/api/products?${params.toString()}`);
                
                // Search for the product in the results
                const products = res.data.result || [];
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    return [productId, {
                        id: product.id,
                        name: product.name || "Unknown Product",
                        price: product.price || 0,
                        image: product.image || "",
                        vat: product.vat || product.VAT || 0
                    }];
                }
                
                return [productId, null];
            } catch (err) {
                console.error(`Failed to fetch product ${productId}:`, err);
                return [productId, null];
            }
        });

        const results = await Promise.all(productPromises);
        const productMap = new Map(results.filter(([_, product]) => product !== null));
        
        console.log(`✅ Fetched ${productMap.size}/${productIds.length} products`);
        
        return productMap;
    } catch (err) {
        console.error("❌ Failed to fetch products:", err);
        return new Map();
    }
}
/**
 * BETTER APPROACH: Get all products for the restaurant, then match by ID
 */
export async function getAllProductsForRestaurant(restaurantId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No auth token found");
            return new Map();
        }

        // Decode token to get userId (same as Menu Management does)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub || payload.nameid || payload.userId;

        console.log(`🔍 Fetching all products for restaurant ${restaurantId}`);
        
        const params = new URLSearchParams();
        params.append("UserId", userId);
        params.append("RestaurantId", restaurantId);
        params.append("PageSize", 1000); // Get all products
        params.append("PageNumber", 1);

        const res = await api.get(`/api/products?${params.toString()}`);
        
        const products = res.data.result || [];
        
        // ✅ Create a map for fast lookup with LOWERCASE keys
        const productMap = new Map();
        products.forEach(product => {
            const normalizedId = (product.id || "").toLowerCase(); // ✅ Normalize to lowercase
            productMap.set(normalizedId, {
                id: product.id,
                name: product.name || "Unknown Product",
                description: product.description || "",
                price: product.price || 0,
                image: product.image || "",
                vat: product.vat || product.VAT || 0,
                category: product.category
            });
        });
        
        console.log(`✅ Loaded ${productMap.size} products for restaurant`);
        console.log(`📋 Product IDs in map:`, Array.from(productMap.keys())); // ✅ Debug log
        
        return productMap;
    } catch (err) {
        console.error("❌ Failed to fetch restaurant products:", err);
        return new Map();
    }
}

/**
 * Enrich order products with full product details from backend
 */
export async function enrichOrderProducts(products, restaurantId) {
    if (!Array.isArray(products) || products.length === 0) {
        console.warn("⚠️ No products to enrich");
        return [];
    }

    console.log("📦 Starting to enrich products:", products);

    try {
        // ✅ Fetch ALL products for the restaurant (same as Menu Management)
        const productMap = await getAllProductsForRestaurant(restaurantId);
        
        if (productMap.size === 0) {
            console.warn("⚠️ No products found for restaurant, using order data as fallback");
            return products.map((p, index) => ({
                id: p.Id || p.id || String(index + 1),
                name: p.Name || p.name || "Product not loaded",
                description: p.Description || p.description || "",
                quantity: Number(p.Qty || p.qty || p.Quantity || p.quantity || 1),
                price: Number(p.Price || p.price || 0),
                image: p.Image || p.image || "",
                vat: Number(p.VAT || p.vat || 0)
            }));
        }

        // Map order products to full product details
        const enrichedProducts = products.map((orderProduct) => {
            const productId = orderProduct.Id || orderProduct.id;
            const normalizedProductId = (productId || "").toLowerCase(); // ✅ Normalize to lowercase
            const quantity = Number(orderProduct.Qty || orderProduct.qty || orderProduct.Quantity || orderProduct.quantity || 1);
            
            console.log(`🔍 Looking for product: ${productId} (normalized: ${normalizedProductId})`); // ✅ Debug log
            
            // ✅ Lookup product from our map using normalized ID
            const productDetails = productMap.get(normalizedProductId);
            
            if (productDetails) {
                console.log(`✅ Found product: ${productDetails.name}`);
                return {
                    id: productId, // Keep original casing for display
                    name: productDetails.name,
                    description: productDetails.description,
                    quantity: quantity,
                    price: Number(productDetails.price),
                    image: productDetails.image,
                    vat: Number(productDetails.vat)
                };
            } else {
                console.warn(`⚠️ Product ${productId} not found in restaurant products`);
                console.warn(`Available IDs:`, Array.from(productMap.keys())); // ✅ Show what's available
                
                // ✅ Use fallback data from order product itself
                return {
                    id: productId,
                    name: orderProduct.Name || orderProduct.name || "Product not found",
                    description: orderProduct.Description || orderProduct.description || "",
                    quantity: quantity,
                    price: Number(orderProduct.Price || orderProduct.price || 0),
                    image: orderProduct.Image || orderProduct.image || "",
                    vat: Number(orderProduct.VAT || orderProduct.vat || 0)
                };
            }
        });

        console.log("✅ All products enriched:", enrichedProducts);
        
        return enrichedProducts;
    } catch (err) {
        console.error("❌ Failed to enrich products:", err);
        
        // Fallback: use order product data directly
        return products.map((p, index) => ({
            id: p.Id || p.id || String(index + 1),
            name: p.Name || p.name || "Product details unavailable",
            description: p.Description || p.description || "",
            quantity: Number(p.Qty || p.qty || p.Quantity || p.quantity || 1),
            price: Number(p.Price || p.price || 0),
            image: p.Image || p.image || "",
            vat: Number(p.VAT || p.vat || 0)
        }));
    }
}

/**
 * Transform backend order to frontend format with enriched data
 */
async function transformOrder(backendOrder) {
    if (!backendOrder) return null;
    
    console.log("📦 Backend Order:", backendOrder);
    
    // Parse products - handle both JSON string and array
    let rawProducts = [];
    try {
        let products = backendOrder.products;
        
        if (typeof products === 'string') {
            products = products.trim();
            if (products.startsWith('\uFEFF')) {
                products = products.substring(1);
            }
            products = JSON.parse(products);
        }
        
        if (!Array.isArray(products)) {
            console.warn("Products is not an array:", products);
            products = [];
        }
        
        rawProducts = products;
        console.log("📋 Raw products from order:", rawProducts);
    } catch (e) {
        console.error("❌ Failed to parse products:", e);
        console.error("Raw products:", backendOrder.products);
    }

    // Enrich products using restaurant ID 
    const restaurantId = backendOrder.restaurantId || backendOrder.RestaurantId;
    const items = await enrichOrderProducts(rawProducts, restaurantId);

    // Parse delivery address
    let address = "";
    try {
        let addr = backendOrder.deliveryAddress;
        
        if (typeof addr === 'string') {
            addr = addr.trim();
            if (addr.startsWith('\uFEFF')) {
                addr = addr.substring(1);
            }
            addr = JSON.parse(addr);
        }
        
        if (typeof addr === 'object' && addr !== null) {
            const street = addr.Street || addr.street || "";
            const city = addr.City || addr.city || "";
            const postalCode = addr.PostalCode || addr.postalCode || addr.PostCode || addr.postCode || "";
            const country = addr.Country || addr.country || "";
            
            const parts = [street, city, postalCode, country].filter(Boolean);
            address = parts.join(", ").trim();
            
            if (!address) {
                address = "No address provided";
            }
        } else {
            address = String(addr || "No address provided");
        }
        
        console.log("✅ Parsed address:", address);
    } catch (e) {
        console.error("❌ Failed to parse address:", e);
        address = backendOrder.deliveryAddress || "No address provided";
    }
    const phone = ""; // Empty for now - you need to add phone to Order table

    // Calculate time ago
    const orderDate = new Date(backendOrder.timestamp);
    const now = new Date();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo;
    if (diffMins < 1) timeAgo = "just now";
    else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    // Calculate subtotal from enriched items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = items.reduce((sum, item) => sum + ((item.price * item.quantity * item.vat) / 100), 0);
    const deliveryFee = 5.00;
    
    let total = backendOrder.total || backendOrder.Total;
    if (!total || total === 0) {
        total = subtotal + tax + deliveryFee;
    }

    const transformedOrder = {
        id: backendOrder.id,
        orderNumber: backendOrder.orderNo || backendOrder.OrderNo || `#ORD-${backendOrder.id.substring(0, 8).toUpperCase()}`,
        restaurantId: restaurantId,
        status: backendOrder.orderStatus !== undefined ? backendOrder.orderStatus : backendOrder.OrderStatus,
        customerName: backendOrder.clientName || backendOrder.ClientName || "Unknown Customer",
        customer: {
            name: backendOrder.clientName || backendOrder.ClientName || "Unknown Customer",
            phone: phone,
            address: address,
            email: backendOrder.clientEmail || backendOrder.ClientEmail || ""
        },
        items: items,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: deliveryFee,
        total: Number(total),
        timestamp: backendOrder.timestamp || backendOrder.Timestamp || backendOrder.createdAt || backendOrder.orderDate,
        orderDate: orderDate.toLocaleDateString(),
        orderTime: orderDate.toLocaleTimeString(),
        timeAgo: timeAgo
    };
    
    console.log("✅ Transformed order:", transformedOrder);
    
    return transformedOrder;
}
// ========== API FUNCTIONS ==========

// Get filtered orders with search
export async function getFilteredOrdersAPI({ restaurantId, searchKey, orderStatus, pageSize = 10, pageNumber = 1 }) {
    try {
        const params = new URLSearchParams();
        if (restaurantId) params.append("RestaurantId", restaurantId);
        if (searchKey) params.append("SearchKey", searchKey);
        if (orderStatus !== undefined && orderStatus !== null) params.append("OrderStatus", orderStatus);
        params.append("PageSize", pageSize);
        params.append("PageNumber", pageNumber);

        const res = await api.get(`/api/orders?${params.toString()}`);
        
        const backendOrders = res.data.result || res.data || [];
        
        // Transform orders in parallel
        const orders = await Promise.all(
            (Array.isArray(backendOrders) ? backendOrders : [])
                .map(order => transformOrder(order))
        );

        return successData({
            orders: orders.filter(Boolean),
            totalCount: res.data.totalCount || orders.length,
            pageNumber: res.data.pageNumber || pageNumber,
            pageSize: res.data.pageSize || pageSize
        });
    } catch (err) {
        console.error("API Error:", err);
        return failure(parseError(err, "Failed to fetch orders"));
    }
}

// Get all orders for a restaurant
export async function getAllOrdersAPI(restaurantId) {
    try {
        const res = await api.get(`/api/orders/all/${restaurantId}`);
        const backendOrders = res.data || [];
        
        const orders = await Promise.all(
            (Array.isArray(backendOrders) ? backendOrders : [])
                .map(order => transformOrder(order))
        );
        
        return successData(orders.filter(Boolean));
    } catch (err) {
        console.error("API Error:", err);
        return failure(parseError(err, "Failed to fetch orders"));
    }
}

// Get order details
export async function getOrderDetailsAPI(restaurantId, orderId) {
    try {
        const res = await api.get(`/api/orders/details/${restaurantId}/${orderId}`);
        const order = await transformOrder(res.data);
        
        if (!order) {
            return failure("Order not found");
        }

        return successData(order);
    } catch (err) {
        console.error("API Error:", err);
        return failure(parseError(err, "Failed to fetch order details"));
    }
}

// Process order (update status)
export async function processOrderAPI({ orderId, restaurantId, orderStatus, data }) {
    try {
        const payload = {
            id: orderId,
            restaurantId: restaurantId,
            nextStatus: orderStatus,
            statusNotes: data || "",
            preparationTimeMinutes: orderStatus === OrderStatus.Accepted ? 30 : 0
        };
        
        console.log("📤 Sending process order request:", payload);

        const res = await api.post("/api/orders/process", payload);
        
        console.log("✅ Process order response:", res.data);

        return successData(res.data);
    } catch (err) {
        console.error("❌ API Error:", err);
        console.error("Error response:", err.response?.data);
        return failure(parseError(err, "Failed to update order status"));
    }
}

// Cancel order
export async function cancelOrderAPI(orderId) {
    try {
        const res = await api.post(`/api/orders/cancel/${orderId}`);
        return successData(res.data);
    } catch (err) {
        console.error("API Error:", err);
        return failure(parseError(err, "Failed to cancel order"));
    }
}