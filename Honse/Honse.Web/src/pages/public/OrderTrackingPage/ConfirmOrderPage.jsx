import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { confirmOrderAPI } from "../../../services/publicOrderService";

export default function ConfirmOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function confirm() {
      const res = await confirmOrderAPI(id);

      if (res.succeeded) {
        navigate(`/public/order-tracking/${id}`);
      } else {
        setError(res.errorMessage || "Invalid or expired confirmation link.");
      }

      setLoading(false);
    }

    confirm();
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        
        {loading && (
          <>
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600">
              Hang tight - we’re confirming your order!
            </p>
          </>
        )}

        {!loading && error && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Confirmation Failed
            </h1>
            <p className="text-gray-700">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}
