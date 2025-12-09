import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../../components/private/Sidebar";
import Header from "../../../components/private/Header";
import { 
    getFilteredOrdersAPI, 
    MOCK_RESTAURANT_ID,
    OrderStatus,
    getStatusLabel,
    getStatusColor
} from "../../../services/orderService";
import "./AllOrdersPage.css";

export default function AllOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("kanban");
    const [restaurantId, setRestaurantId] = useState(
        localStorage.getItem("restaurantId") || MOCK_RESTAURANT_ID
    );

    useEffect(() => {
        if (!restaurantId) {
            setRestaurantId(MOCK_RESTAURANT_ID);
            localStorage.setItem("restaurantId", MOCK_RESTAURANT_ID);
        }
    }, [restaurantId]);

    const fetchOrders = useCallback(async () => {
        if (!restaurantId) {
            setOrders([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await getFilteredOrdersAPI({
                restaurantId,
                searchKey: searchQuery || undefined,
                pageSize: 100,
                pageNumber: 1,
            });

            if (result.succeeded) {
                setOrders(result.data.orders || []);
                setError("");
            } else {
                setError(result.errorMessage || "Failed to load orders");
                setOrders([]);
            }
        } catch (err) {
            setError("Failed to load orders. Please try again later.");
            console.error("Error fetching orders:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [restaurantId, searchQuery]);

    // Debounce search - only fetch after user stops typing for 500ms
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, fetchOrders]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const getOrdersByStatus = (status) => {
        return orders.filter(order => order.status === status);
    };

    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId} />
                <main className="flex-1 p-8">
                    <div className="loading">Loading orders...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar onRestaurantChange={setRestaurantId} />
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <Header 
                        title="Order Management" 
                        addPath={null}
                        selectedRestaurant={restaurantId}
                    />

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    {/* Search and View Toggle */}
                    <div className="flex justify-between items-center mb-6 gap-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Search by order number or customer name"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                                {loading && orders.length > 0 && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 text-xs font-medium">
                                        Searching...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode("kanban")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewMode === "kanban" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <span className="material-symbols-outlined">view_kanban</span>
                                <span>Kanban</span>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewMode === "list" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <span className="material-symbols-outlined">list</span>
                                <span>List</span>
                            </button>
                        </div>
                    </div>

                    {!restaurantId ? (
                        <div className="text-center py-12 text-gray-500">
                            Please select a restaurant to view orders
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No orders found
                        </div>
                    ) : viewMode === "kanban" ? (
                        /* Kanban View */
                        <div className="kanban-container">
                            {[OrderStatus.New, OrderStatus.Accepted, OrderStatus.Delivery, OrderStatus.Finished, OrderStatus.Cancelled].map((status) => {
                                const statusOrders = getOrdersByStatus(status);
                                return (
                                    <div key={status} className="kanban-column">
                                        <div 
                                            className="kanban-header" 
                                            style={{ backgroundColor: getStatusColor(status) }}
                                        >
                                            <h3>{getStatusLabel(status)} ({statusOrders.length})</h3>
                                        </div>
                                        <div className="kanban-cards">
                                            {statusOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="order-card"
                                                    onClick={() => handleOrderClick(order.id)}
                                                >
                                                    <div className="order-card-header">
                                                        <span className="order-number">{order.orderNumber}</span>
                                                        <span className="order-time">{order.timeAgo}</span>
                                                    </div>
                                                    <div className="order-card-body">
                                                        <p className="customer-name">{order.customerName}</p>
                                                        <p className="order-total">${order.total.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                        <tr>
                                            <th className="px-6 py-3">Order Number</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Total</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr 
                                                key={order.id} 
                                                className="border-b hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleOrderClick(order.id)}
                                            >
                                                <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                                                <td className="px-6 py-4">{order.customerName}</td>
                                                <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <span 
                                                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{order.timeAgo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}