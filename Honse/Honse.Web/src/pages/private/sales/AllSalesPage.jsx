import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../../../components/private/Sidebar";
import Header from "../../../components/private/Header";
import { 
    getFilteredOrdersAPI,
    OrderStatus,
    getStatusLabel,
    getStatusColor
} from "../../../services/orderService";
import "./AllSalesPage.css";

function FormattedDate({ timestamp }) {
    if (!timestamp) return "Unknown";
    
    const orderDate = new Date(timestamp);
    
    
    if (isNaN(orderDate.getTime())) {
        return "Unknown";
    }
    
    return orderDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

export default function AllSalesPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); 
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId"));

    const fetchSalesData = useCallback(async () => {
        if (!restaurantId) {
            setOrders([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const result = await getFilteredOrdersAPI({
                restaurantId,
                pageSize: 1000,
                pageNumber: 1,
            });

            if (result.succeeded) {
                // Finished = 3, Cancelled = -1
                const completedOrders = (result.data.orders || []).filter(order => 
                    order.status === OrderStatus.Finished || order.status === OrderStatus.Cancelled
                );
                
                let filteredOrders = completedOrders;

                if (searchQuery && searchQuery.trim() !== "") {
                    const query = searchQuery.toLowerCase().trim();
                    filteredOrders = filteredOrders.filter(order => {
                        const orderNumber = (order.orderNumber || "").toLowerCase();
                        const customerName = (order.customerName || "").toLowerCase();
                        return orderNumber.includes(query) || customerName.includes(query);
                    });
                }
                
                if (statusFilter === "delivered") {
                    filteredOrders = filteredOrders.filter(order => order.status === OrderStatus.Finished);
                } else if (statusFilter === "cancelled") {
                    filteredOrders = filteredOrders.filter(order => order.status === OrderStatus.Cancelled);
                }

                if (dateRange.start) {
                    const startDate = new Date(dateRange.start);
                    filteredOrders = filteredOrders.filter(order => 
                        new Date(order.timestamp) >= startDate
                    );
                }
                if (dateRange.end) {
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999); // End of day
                    filteredOrders = filteredOrders.filter(order => 
                        new Date(order.timestamp) <= endDate
                    );
                }
                
                setOrders(filteredOrders);
                setError("");
            } else {
                setError(result.errorMessage || "Failed to load sales data");
                setOrders([]);
            }
        } catch (err) {
            setError("Failed to load sales data. Please try again later.");
            console.error("Error fetching sales:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [restaurantId, searchQuery, statusFilter, dateRange]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSalesData();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, fetchSalesData]);

    useEffect(() => {
        fetchSalesData();
    }, [statusFilter, dateRange]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleOrderClick = (orderId) => {
        navigate(`/sales/${orderId}`);
    };

    const handleExportData = () => {
        
        const headers = ["Order ID", "Order Number", "Customer", "Date", "Total", "Payment Status", "Order Status"];
        const csvRows = [
            headers.join(","),
            ...orders.map(order => [
                order.id,
                order.orderNumber,
                order.customerName,
                new Date(order.timestamp).toLocaleDateString(),
                `$${order.total.toFixed(2)}`,
                "Paid", 
                getStatusLabel(order.status)
            ].join(","))
        ];
        
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const totalRevenue = orders.filter(o => o.status === OrderStatus.Finished).reduce((sum, order) => sum + order.total, 0);
    const deliveredCount = orders.filter(o => o.status === OrderStatus.Finished).length;
    const cancelledCount = orders.filter(o => o.status === OrderStatus.Cancelled).length;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId} />
                <main className="flex-1 p-8">
                    <div className="loading">Loading sales data...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar onRestaurantChange={setRestaurantId} />
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header with Export Button */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
                        <button
                            onClick={handleExportData}
                            disabled={orders.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="material-symbols-outlined">download</span>
                            Export Data
                        </button>
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                                </div>
                                <span className="material-symbols-outlined text-green-600 text-4xl">attach_money</span>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Delivered Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{deliveredCount}</p>
                                </div>
                                <span className="material-symbols-outlined text-blue-600 text-4xl">check_circle</span>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Cancelled Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{cancelledCount}</p>
                                </div>
                                <span className="material-symbols-outlined text-red-600 text-4xl">cancel</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setDateRange({ start: "", end: "" });
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Reset
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        placeholder="Start date"
                                    />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        placeholder="End date"
                                    />
                                </div>
                            </div>

                            {/* Order Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                >
                                    <option value="all">All</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        placeholder="Order number or customer"
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
                        </div>
                    </div>

                    {/* Sales Table */}
                    {!restaurantId ? (
                        <div className="text-center py-12 text-gray-500">
                            Please select a restaurant to view sales data
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {searchQuery || statusFilter !== "all" || dateRange.start || dateRange.end 
                                ? "No sales found matching your filters" 
                                : "No completed orders yet"}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Order Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Total Amount
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Order Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr 
                                                key={order.id} 
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => handleOrderClick(order.id)}
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {order.orderNumber}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {order.customerName}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <FormattedDate timestamp={order.timestamp} />
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    ${order.total.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span 
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
                                Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
