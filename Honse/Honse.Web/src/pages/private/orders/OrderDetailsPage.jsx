import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import * as signalR from '@microsoft/signalr';
import Sidebar from "../../../components/private/Sidebar";
import { 
    getOrderDetailsAPI, 
    processOrderAPI, 
    OrderStatus,
    getStatusLabel,
    getStatusColor,
    getNextStatus,
    cancelOrderAPI
} from "../../../services/orderService";
import "./OrderDetailsPage.css";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId"));
    const [connection, setConnection] = useState(null);

    const fetchOrderDetails = useCallback(async () => {
        if (!restaurantId || !orderId) return;

        try {
            setLoading(true);
            const result = await getOrderDetailsAPI(restaurantId, orderId);

            if (result.succeeded) {
                setOrder(result.data);
                setError("");
            } else {
                setError(result.errorMessage || "Failed to load order details");
            }
        } catch (err) {
            setError("Failed to load order details. Please try again later.");
            console.error("Error fetching order details:", err);
        } finally {
            setLoading(false);
        }
    }, [restaurantId, orderId]);

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
        if (connection && orderId) {
            connection.start()
                .then(() => {
                    console.log('✅ SignalR Connected in Order Details');

                    // When an order is updated - check if it's THIS order
                    connection.on('PingOrderUpdated', (updatedOrderId) => {
                        console.log(`🔔 Order updated signal received: ${updatedOrderId}`);
                        console.log(`📍 Current order ID: ${orderId}`);
                        
                        // Only refresh if the updated order is the one we're viewing
                        if (updatedOrderId === orderId) {
                            console.log(`🔄 Refreshing current order details`);
                            fetchOrderDetails();
                        } else {
                            console.log(`⏭️ Ignoring update for different order`);
                        }
                    });
                })
                .catch(e => {
                    console.error('❌ SignalR Connection failed:', e);
                });
        }

        return () => {
            if (connection) {
                connection.off('PingOrderUpdated');
            }
        };
    }, [connection, orderId, fetchOrderDetails]);

    // Initial fetch
    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleStatusChange = async (newStatus) => {
        if (!order) return;

        setProcessing(true);
        try {
            const result = await processOrderAPI({
                orderId: order.id,
                restaurantId: restaurantId,
                orderStatus: newStatus,
                data: ""
            });

            if (result.succeeded) {
                // Don't manually update state - let SignalR handle it
                console.log("✅ Order status update sent, waiting for SignalR notification...");
            } else {
                alert(result.errorMessage || "Failed to update order status");
            }
        } catch (err) {
            alert("Failed to update order status");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        await cancelOrderAPI(order.id);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId} />
                <main className="flex-1 p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading order details...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId} />
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                            {error || "Order not found"}
                        </div>
                        <button
                            onClick={() => navigate("/orders")}
                            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Back to Orders
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const total = order.total || (order.subtotal + order.tax + order.deliveryFee);
    const nextStatusInfo = getNextStatus(order.status);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar onRestaurantChange={setRestaurantId} />
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate("/orders")}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm text-gray-500">Status</span>
                                <span 
                                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {getStatusLabel(order.status)}
                                </span>
                                {/* Live indicator */}
                                {connection && connection.state === signalR.HubConnectionState.Connected && (
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Live
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {order.status !== OrderStatus.Finished && order.status !== OrderStatus.Cancelled && (
                        <div className="flex gap-3 mb-6">
                            {nextStatusInfo && (
                                <button
                                    onClick={() => handleStatusChange(nextStatusInfo.next)}
                                    disabled={processing}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
                                >
                                    {processing && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    {processing ? "Processing..." : nextStatusInfo.label}
                                </button>
                            )}
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                className="px-6 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                            >
                                Cancel Order
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-6">
                        {/* Order Items */}
                        <div className="col-span-2">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4">
                                    Order Items ({order.items.length})
                                </h2>
                                <div className="space-y-4">
                                    {order.items.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">shopping_cart</span>
                                            <p>No items in this order</p>
                                            <p className="text-sm">This might be a data issue</p>
                                        </div>
                                    ) : (
                                        order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                                {/* Product Image - Always show with fallback */}
                                                <div className="w-24 h-24 flex-shrink-0">
                                                    {item.image ? (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                // Show placeholder on error
                                                                e.target.src = 'https://via.placeholder.com/96x96/e5e7eb/6b7280?text=No+Image';
                                                            }}
                                                        />
                                                    ) : (
                                                        // Placeholder when no image URL
                                                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-gray-400 text-4xl">
                                                                restaurant
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">
                                                                {item.name}
                                                            </h3>
                                                            {item.description && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium ml-4">
                                                            ${item.price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-sm text-gray-500">
                                                            Quantity: {item.quantity}
                                                        </span>
                                                        <span className="font-semibold text-lg">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 pt-6 border-t space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (VAT)</span>
                                        <span>${order.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span>${order.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details & Order Summary */}
                        <div className="space-y-6">
                            {/* Customer Details */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4">Customer Details</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{order.customer.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-gray-400">mail</span>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">
                                                {order.customer.email || "No email provided"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-gray-400">phone</span>
                                        <div>
                                            <p className="text-sm text-gray-500">Contact</p>
                                            <p className="font-medium">
                                                {order.customer.phone || "No phone provided"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-gray-400">location_on</span>
                                        <div>
                                            <p className="text-sm text-gray-500">Delivery Address</p>
                                            <p className="font-medium">{order.customer.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Order Date</span>
                                        <span className="font-medium">{order.orderDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Order Time</span>
                                        <span className="font-medium">{order.orderTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Time Ago</span>
                                        <span className="font-medium">{order.timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}