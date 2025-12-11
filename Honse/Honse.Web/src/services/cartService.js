const CART_KEY = "cart";

export function getCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse cart from storage", e);
        return [];
    }
}

export function saveCartToStorage(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to storage", e);
    }
}

export function addItemToCart(product, quantity = 1) {
    const cart = getCartFromStorage();

    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex !== -1) {
        cart[existingIndex] = {
            ...cart[existingIndex],
            quantity: cart[existingIndex].quantity + quantity,
        };
    } else {
        cart.push({
            ...product,
            quantity,
        });
    }

    saveCartToStorage(cart);
    return cart;
}

export function removeItemFromCart(productId) {
    const cart = getCartFromStorage().filter((item) => item.id !== productId);
    saveCartToStorage(cart);
    return cart;
}

export function updateCartItemQuantity(productId, quantity) {
    const cart = getCartFromStorage().map((item) =>
        item.id === productId ? { ...item, quantity } : item
    );
    saveCartToStorage(cart);
    return cart;
}

export function clearCart() {
    saveCartToStorage([]);
    return [];
}
