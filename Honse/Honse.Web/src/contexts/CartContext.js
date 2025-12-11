import React, { createContext, useContext, useEffect, useState } from "react";
import {
    getCartFromStorage,
    saveCartToStorage,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    clearCart,
} from "../services/cartService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => getCartFromStorage());

    useEffect(() => {
        saveCartToStorage(cart);
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        const updated = addItemToCart(product, quantity);
        setCart(updated);
    };

    const removeFromCart = (id) => {
        const updated = removeItemFromCart(id);
        setCart(updated);
    };

    const updateQuantity = (id, quantity) => {
        const updated = updateCartItemQuantity(id, quantity);
        setCart(updated);
    };

    const clear = () => {
        const updated = clearCart();
        setCart(updated);
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clear }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return ctx;
}
