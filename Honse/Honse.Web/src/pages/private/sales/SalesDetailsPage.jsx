import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../../components/private/Sidebar";
import { 
    getOrderDetailsAPI, 
    OrderStatus,
    getStatusLabel,
    getStatusColor
} from "../../../services/orderService";
import "./SalesDetailsPage.css";

export default function SalesDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId"));

    const fetchOrderDetails = useCallback(async () => {
        if (!restaurantId || !orderId) return;

        try {
            setLoading(true);
            const result = await getOrderDetailsAPI(restaurantId, orderId);

            if (result.succeeded) {
                const orderData = result.data;
                
                
                if (orderData.status !== OrderStatus.Finished && orderData.status !== OrderStatus.Cancelled) {
                    setError("This order is not completed yet. Please check the Orders page.");
                    setOrder(null);
                } else {
                    setOrder(orderData);
                    setError("");
                }
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

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar onRestaurantChange={setRestaurantId}/>
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
                <Sidebar onRestaurantChange={(id) => {navigate("/sales")}} />
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                            {error || "Order not found"}
                        </div>
                        <button
                            onClick={() => navigate("/sales")}
                            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Back to Sales
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const total = (order.subtotal + order.tax + order.deliveryFee);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar onRestaurantChange={(id) => {navigate("/sales")}} />
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate("/sales")}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">Order Details - {order.orderNumber}</h1>
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

                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            {/* Order Items Card */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600">shopping_cart</span>
                                    Ordered Items ({order.items.length})
                                </h2>
                                <div className="space-y-4">
                                    {order.items.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">shopping_cart</span>
                                            <p>No items in this order</p>
                                        </div>
                                    ) : (
                                        order.items.map((item, index) => (
                                            <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {item.image ? (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextElementSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div 
                                                        className="w-full h-full flex items-center justify-center text-gray-400"
                                                        style={{ display: item.image ? 'none' : 'flex' }}
                                                    >
                                                        <span className="material-symbols-outlined text-3xl">restaurant</span>
                                                    </div>
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>Quantity: {item.quantity}</span>
                                                        <span>•</span>
                                                        <span className="font-medium">${item.price.toFixed(2)} each {`(${(item.price * item.vat / 100)} is VAT)`}</span>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        ${((item.price - (item.price * item.vat / 100)) * item.quantity).toFixed(2)}
                                                    </p>
                                                    {item.vat > 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            +${((item.price * item.vat / 100) * item.quantity).toFixed(2)} VAT
                                                            
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600">person</span>
                                    Customer Information
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Name:</p>
                                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                                    </div>
                                    
                                    {order.customer.email && (
                                        <div>
                                            <p className="text-gray-500 mb-1">Contact:</p>
                                            <p className="font-medium text-gray-900 break-all">{order.customer.email}</p>
                                        </div>
                                    )}
                                    
                                    {order.customer.phone && (
                                        <div>
                                            <p className="text-gray-500 mb-1">Phone:</p>
                                            <p className="font-medium text-gray-900">{order.customer.phone}</p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <p className="text-gray-500 mb-1">Delivery Address:</p>
                                        <p className="font-medium text-gray-900">{order.customer.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600">receipt</span>
                                    Payment Details
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium text-gray-900">${order.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee:</span>
                                        <span className="font-medium text-gray-900">${order.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between">
                                        <span className="font-bold text-gray-900">Final Total:</span>
                                        <span className="font-bold text-gray-900 text-lg">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/*Timeline */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600">schedule</span>
                                    Order Timeline
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Order Date:</p>
                                        <p className="font-medium text-gray-900">{order.orderDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Order Time:</p>
                                        <p className="font-medium text-gray-900">{order.orderTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Order ID:</p>
                                        <p className="font-medium text-gray-900 text-xs break-all">{order.id}</p>
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
