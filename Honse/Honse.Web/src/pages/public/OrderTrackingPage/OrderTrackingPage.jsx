import React, { useEffect, useState } from "react";
import { getOrderDetailsAPI, cancelOrderAPI, STATUS_INFO } from "../../../services/publicOrderService";
import { useNavigate, useParams } from "react-router";
import * as signalR from '@microsoft/signalr'

export default function OrderTrackingPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const [minutesRemaining, setMinutesRemaining] = useState(0);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:2000/api/orderinghub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (!connection)
      return;

    connection.start().then(() => {
      console.log("SignalR connected.");

      connection.on('PingOrderUpdated', updatedId => {

        if (updatedId === id)
          reloadOrder();
      });
    })
      .catch(e => console.log('Connection failed: ', e))

    return () => {
      connection.stop();
    };
  }, [connection, id]);


  async function reloadOrder() {
    const res = await getOrderDetailsAPI(id);

    if (res.succeeded) {
      setOrder(res.data);
    } else {
      console.error(res.errorMessage);
      setError(res.errorMessage);
    }
  }

  useEffect(() => {
    setLoading(true);
    reloadOrder().finally(() => setLoading(false));
  }, [id]);

  const navigate = useNavigate();

  async function handleCancelOrder() {
    setIsCancelling(true);
    try {
      const res = await cancelOrderAPI(id);
      if (res.succeeded) {

        navigate("/public/restaurants");
      } else {
        console.error(res.errorMessage);
        setIsCancelling(false);
        setError(res.errorMessage);
      }
    } catch (err) {
      console.error(err);
      setIsCancelling(false);

    }
  }

  useEffect(() => {
    if (!order) return;
    const deliveryTime = new Date(order.preparationTime);
    deliveryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setMinutesRemaining(Math.max(0, Math.round((deliveryTime - new Date()) / 60000)));

    const interval = setInterval(() => {
      const newMinutes = Math.max(0, Math.round((deliveryTime - new Date()) / 60000));
      setMinutesRemaining(newMinutes);
    }, 60_000);

    return () => clearInterval(interval);
  }, [order]);

  if (loading) return <p className="p-10 text-lg text-gray-500">Loading...</p>;
  if (!order) return <p className="p-10 text-lg text-red-500">Order not found.</p>;

  const products = order.products ?? [];
  const clientName = order.clientName;
  const clientAddress = order.deliveryAddress;
  const clientEmail = order.clientEmail;
  const orderNo = order.orderNo;
  const subtotal = products.reduce((sum, item) => sum + item.total, 0);
  const deliveryFee = 5;
  const total = subtotal + deliveryFee;
  const currentStatus = order.orderStatus;
  const statusHistory = order.statusHistory ?? [];
  const deliveryTime = new Date(order.preparationTime);
  deliveryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const statusStages = ["confirmed", "preparing", "out for delivery", "delivered"];
  const progressIndexMap = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    [-1]: 0
  };

  const statusIndex = progressIndexMap[currentStatus] ?? 0;
  const progressPercent = ((statusIndex + 1) / 4) * 100;
  const statusLabel = statusStages[statusIndex];

  return (
    <div className="max-w-7xl mx-auto">

      {/* Heading */}
      <div className="pt-6 pb-8">
        <h1 className="text-4xl font-extrabold">
          Your order is <span className="text-orange-500">{statusLabel}</span>!
        </h1>
        <p className="text-2xl text-gray-600">Order Number: {orderNo}</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8">

          {/* Order Items */}
          <div className="bg-white border border-[#e7d9cf] rounded-xl shadow-sm">
            <h2 className="text-lg font-bold p-4 border-b border-[#e7d9cf]">
              Order Items ({products.length})
            </h2>

            <ul className="divide-y divide-[#e7d9cf]">
              {products.map((item, i) => (
                <li key={i} className="p-4 flex gap-4">
                  <img
                    src={item.imgUrl || item.image || item.Image || "/placeholder-food.jpg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-food.jpg";
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                    <p className="text-sm">${item.total.toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="border-t border-[#e7d9cf] p-4 text-sm space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <p className="text-lg font-bold">{statusLabel}</p>

            <div className="w-full bg-blue-100 rounded-lg h-3 mt-2">
              <div
                className="h-3 bg-blue-500 rounded-lg transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-4 text-sm text-gray-600 mt-2">
              {statusStages.map((stage, i) => (
                <div
                  key={i}
                  className={`text-center font-medium ${statusIndex >= i ? "text-black" : ""}`}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
          {order.status !== -1 && order.status !== 3 && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="mt-4 inline-flex px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-lg mx-auto"
            >
              Cancel Order
            </button>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-8">

          {/* ETA */}
          <div className="bg-white p-6 rounded-xl border border-[#e7d9cf] shadow-sm">
            <h2 className="text-lg font-bold mb-1">Estimated Delivery</h2>

            {order.orderStatus === 0 ? (
               <p className="text-3xl font-black text-[#3b82f6]">
                Waiting for your order to be accepted
              </p>
            ) : (
              <>
                <p className="text-4xl font-black text-[#3b82f6]">
                  {deliveryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-gray-600 mt-1">
                  Arriving in {minutesRemaining} minutes
                </p>
              </>
            )}
          </div>


          <div className="bg-card-background-light rounded-xl p-6 shadow-sm border border-border-light">
            <h2 className="text-lg font-bold text-text-light mb-4">
              Order History
            </h2>

            <ul className="space-y-4">
              {statusHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((entry, index) => {
                  const info = STATUS_INFO[entry.status];
                  return (
                    <li key={index} className="flex items-start gap-4">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-white mt-1">
                        <span className="material-symbols-outlined text-base ">
                          {info.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-text-light">
                          {info.label}
                        </p>
                        <p className="text-sm text-secondary-text-light">
                          {new Date(entry.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Customer Details */}
          <div className="rounded-xl border border-gray-200/50 bg-white shadow-sm">
            <h2 className="text-[#1b130d] text-lg font-bold p-4 border-b border-gray-200/50">
              Customer Details
            </h2>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-500">person</span>
                <div>
                  <p className="text-sm text-[#9a6c4c]">Name</p>
                  <p className="font-medium text-[#1b130d]">{clientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-500">mail</span>
                <div>
                  <p className="text-sm text-[#9a6c4c]">Email</p>
                  <p className="font-medium text-[#1b130d]">{clientEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-gray-500 mt-0.5">home</span>
                <div>
                  <p className="text-sm text-[#9a6c4c]">Delivery Address</p>
                  <p className="font-medium text-[#1b130d]">
                    {typeof clientAddress === "object" && clientAddress
                      ? `${clientAddress.street}, ${clientAddress.city}, ${clientAddress.country} ${clientAddress.postalCode}`
                      : clientAddress || "No address provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Cancellation</h2>
            <p className="mb-6">
              Are you sure you want to cancel your order? You will not receive a refund.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
