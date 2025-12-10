import React from "react";
import { Link } from "react-router";
import "./CheckoutPage.css";

export default function OrderEmailConfirmationPage() {
    return (
        <div className="order-confirm-page">
            <div className="order-confirm-container">
                <h2>Confirm your order</h2>
                <p className="confirm-message">
                    We’ve sent you an email with a confirmation link.
                    Please open your inbox and confirm the order to complete it.
                </p>
                <p className="spam-message">
                    If you don’t see the email in a few minutes, check your spam folder or
                    try again later.
                </p>
                <Link to="/" className="btn btn-primary">
                    Back to home
                </Link>
            </div>
        </div>
    );
}
