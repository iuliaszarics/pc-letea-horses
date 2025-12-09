import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../../components/private/Sidebar";
import { 
    getOrderDetailsAPI, 
    processOrderAPI, 
    OrderStatus,
    getStatusLabel,
    getStatusColor,
    getNextStatus
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
                setOrder({ ...order, status: newStatus });
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
        await handleStatusChange(OrderStatus.Cancelled);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId} />
                <main className="flex-1 p-8">
                    <div className="loading">Loading order details...</div>
                </main>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId} />
                <main className="flex-1 p-8">
                    <div className="error">{error || "Order not found"}</div>
                </main>
            </div>
        );
    }

    const total = order.subtotal + order.tax + order.deliveryFee;
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
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                    {nextStatusInfo.label}
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
                                <h2 className="text-lg font-bold mb-4">Order Items ({order.items.length})</h2>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium">{item.name}</h3>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-500">{item.description}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                                                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 pt-6 border-t space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (5%)</span>
                                        <span>${order.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span>${order.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
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
                                        <span className="material-symbols-outlined text-gray-400">phone</span>
                                        <div>
                                            <p className="text-sm text-gray-500">Contact</p>
                                            <p className="font-medium">{order.customer.phone}</p>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}