import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import * as signalR from '@microsoft/signalr';
import Sidebar from "../../../components/private/Sidebar";
import Header from "../../../components/private/Header";
import { 
    getFilteredOrdersAPI,
    getOrderDetailsAPI,
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
    const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId"));
    const [connection, setConnection] = useState(null);

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

    // Fetch single order and update/add to list
    const fetchAndUpdateOrder = useCallback(async (orderId) => {
        if (!restaurantId) return;

        try {
            console.log(`🔄 Fetching updated order: ${orderId}`);
            const result = await getOrderDetailsAPI(restaurantId, orderId);

            if (result.succeeded) {
                const updatedOrder = result.data;
                
                setOrders(prevOrders => {
                    const existingIndex = prevOrders.findIndex(o => o.id === orderId);
                    
                    if (existingIndex !== -1) {
                        // Update existing order
                        console.log(`✅ Updated order ${orderId} in list`);
                        const newOrders = [...prevOrders];
                        newOrders[existingIndex] = updatedOrder;
                        return newOrders;
                    } else {
                        // Add new order (if it belongs to this restaurant)
                        if (updatedOrder.restaurantId === restaurantId) {
                            console.log(`✅ Added new order ${orderId} to list`);
                            return [updatedOrder, ...prevOrders];
                        }
                        return prevOrders;
                    }
                });
            }
        } catch (err) {
            console.error(`❌ Failed to fetch order ${orderId}:`, err);
        }
    }, [restaurantId]);

    // Initialize SignalR connection
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:2000/api/orderinghub`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .build();
        
        setConnection(newConnection);
        
        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, []);

    // Setup SignalR event listeners
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('✅ SignalR Connected');

                    // When an order is updated (status changed)
                    connection.on('PingOrderUpdated', (orderId) => {
                        console.log(`🔔 Order updated: ${orderId}`);
                        fetchAndUpdateOrder(orderId);
                    });

                    // When a new order is added
                    connection.on('PingOrderAdded', (orderId) => {
                        console.log(`🔔 New order added: ${orderId}`);
                        fetchAndUpdateOrder(orderId);
                    });
                })
                .catch(e => {
                    console.error('❌ SignalR Connection failed:', e);
                });
        }

        return () => {
            if (connection) {
                connection.off('PingOrderUpdated');
                connection.off('PingOrderAdded');
            }
        };
    }, [connection, fetchAndUpdateOrder]);

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

                    {/* SignalR Connection Status */}
                    {connection && connection.state === signalR.HubConnectionState.Connected && (
                        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span>Live updates enabled</span>
                        </div>
                    )}

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
                            {searchQuery ? "No orders found matching your search" : "No orders found"}
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