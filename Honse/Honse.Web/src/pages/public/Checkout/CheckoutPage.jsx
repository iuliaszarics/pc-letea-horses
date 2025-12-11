import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useCart } from "../../../contexts/CartContext";
import "./CheckoutPage.css";

export default function CheckoutPage() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, clear } = useCart();

    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
    });

    const restaurantCart = useMemo(
        () =>
            cart.filter(
                (item) => String(item.restaurantId) === String(restaurantId)
            ),
        [cart, restaurantId]
    );

    const subtotal = restaurantCart.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
    );
    const deliveryFee = 5;
    const total = subtotal + deliveryFee;

    useEffect(() => {
        if (restaurantCart.length === 0) {
            setError("Your cart is empty for this restaurant.");
        } else {
            setError(null);
        }
    }, [restaurantCart.length]);

    const handleQuantityChange = (id, delta) => {
        const item = restaurantCart.find((p) => p.id === id);
        if (!item) return;

        const newQuantity = item.quantity + delta;

        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            updateQuantity(id, newQuantity);
        }
    };

    const handleRemove = (id) => {
        removeFromCart(id);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError(null);

        if (restaurantCart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (!customer.email) {
            setError("Please enter your email address.");
            return;
        }

        // TODO: later:
        // 1) Call backend to validate restaurant & products
        // 2) If invalid -> show error & do not proceed
        // 3) If valid -> send order + trigger email

        try {
            // backend call placeholder
            // await placeOrderAPI({ restaurantId, items: restaurantCart, customer });

            clear();
            navigate("/order/confirm-email");
        } catch (err) {
            console.error("Failed to place order", err);
            setError("Something went wrong while placing your order. Try again.");
        }
    };

    if (restaurantCart.length === 0) {
        return (
            <div className="checkout-page">
                <h2>Checkout</h2>
                <p>Your cart is empty for this restaurant.</p>
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate(`/public/restaurants/${restaurantId}`)
                    }
                >
                    Back to restaurant
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handlePlaceOrder}>
                    <h3>Delivery details</h3>

                    <label>
                        Full name
                        <input
                            type="text"
                            name="fullName"
                            value={customer.fullName}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Email address
                        <input
                            type="email"
                            name="email"
                            value={customer.email}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Phone
                        <input
                            type="tel"
                            name="phone"
                            value={customer.phone}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Address
                        <input
                            type="text"
                            name="address"
                            value={customer.address}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        City
                        <input
                            type="text"
                            name="city"
                            value={customer.city}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Country
                        <input
                            type="text"
                            name="country"
                            value={customer.country}
                            onChange={handleChange}
                        />
                    </label>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={restaurantCart.length === 0}
                    >
                        Place order
                    </button>
                </form>

                <div className="checkout-cart">
                    <h3>Your items</h3>
                    {restaurantCart.map((item) => (
                        <div key={item.id} className="checkout-item">
                            <div className="checkout-item-main">
                                <span className="checkout-item-name">{item.name}</span>
                                <span className="checkout-item-price">${item.price.toFixed(2)}</span>
                            </div>
                            <div className="checkout-item-controls">
                                <div className="quantity-controls">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(item.id, -1)}
                                    >
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(item.id, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="checkout-remove"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="checkout-totals">
                        <p>
                            Subtotal <span>${subtotal.toFixed(2)}</span>
                        </p>
                        <p>
                            Delivery fee <span>${deliveryFee.toFixed(2)}</span>
                        </p>
                        <h4>
                            Total <span>${total.toFixed(2)}</span>
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
