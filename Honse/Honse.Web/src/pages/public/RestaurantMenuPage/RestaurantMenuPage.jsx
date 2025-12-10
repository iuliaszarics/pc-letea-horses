import React, { useEffect, useState } from "react";
import "./RestaurantMenuPage.css";
import { getPublicRestaurantsMenu } from "../../../services/restaurantService";
import { useParams, useNavigate } from "react-router";
import { useCart } from "../../../contexts/CartContext";

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { cart, addToCart, updateQuantity, removeFromCart, clear } = useCart();

  const currentRestaurantId = String(restaurantId);

  const [showReplaceCartModal, setShowReplaceCartModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingRestaurantId, setPendingRestaurantId] = useState(null);

  const restaurantCart = cart.filter(
      (item) =>
          item.restaurantId &&
          String(item.restaurantId) === currentRestaurantId
  );

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPublicRestaurantsMenu(restaurantId);
        if (res?.succeeded && res?.restaurant) {
          setRestaurant(res.restaurant);
        } else {
          throw new Error("Invalid.");
        }
      } catch (err) {
        console.error("Failed to load restaurant menu:", err);
        setError("Failed to load restaurant menu. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) loadMenu();
  }, [restaurantId]);

  const handleAdd = (product, categoryRestaurantId) => {
    if (!product) return;

    const itemRestaurantId = String(
        categoryRestaurantId || currentRestaurantId
    );

    const hasOtherRestaurantItems =
        cart.length > 0 &&
        cart.some((item) => {
          if (!item.restaurantId) return true;
          return String(item.restaurantId) !== itemRestaurantId;
        });

    if (hasOtherRestaurantItems) {
      setPendingProduct(product);
      setPendingRestaurantId(itemRestaurantId);
      setShowReplaceCartModal(true);
      return;
    }

    addToCart({ ...product, restaurantId: itemRestaurantId }, 1);
  };

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

  const confirmReplaceCart = () => {
    if (!pendingProduct || !pendingRestaurantId) {
      setShowReplaceCartModal(false);
      return;
    }

    clear();
    addToCart(
        { ...pendingProduct, restaurantId: pendingRestaurantId },
        1
    );

    setPendingProduct(null);
    setPendingRestaurantId(null);
    setShowReplaceCartModal(false);
  };

  const cancelReplaceCart = () => {
    setPendingProduct(null);
    setPendingRestaurantId(null);
    setShowReplaceCartModal(false);
  };

  const subtotal = restaurantCart.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
  );
  const deliveryFee = 5;
  const total = subtotal + deliveryFee;

  if (loading) return <div className="loading">Loading menu...</div>;

  if (error)
    return (
        <div className="error-message">
          <h2>{error}</h2>
        </div>
    );

  if (!restaurant)
    return <div className="error-message">No restaurant data found.</div>;

  return (
      <div className="menu-page">
        <div className="header">
          <img
              src={
                  restaurant.image ||
                  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
              }
              alt={restaurant.name}
              className="header-img"
          />
          <div className="header-content">
            <h1>{restaurant.name}</h1>
            <p>Cuisine: {restaurant.cuisineType}</p>
            <p>{restaurant.description}</p>
            <div className="header-info">
              <span>★ 4.5 stars</span>
              <span>⛟ ${deliveryFee.toFixed(2)} delivery fee</span>
              <span>⏱ 20–30 min</span>
            </div>
          </div>
        </div>

        <div className="menu-layout">
          <div className="menu-list">
            {restaurant.categories?.map((category) => (
                <div key={category.id} className="menu-category">
                  <h2>{category.name}</h2>
                  <div className="menu-items">
                    {category.products
                        ?.filter((p) => p.isEnabled)
                        .map((p) => (
                            <div key={p.id} className="menu-card">
                              <img src={p.image} alt={p.name} className="menu-image" />
                              <div className="menu-info">
                                <h3>{p.name}</h3>
                                <p>{p.description}</p>
                                <div className="menu-bottom">
                                  <span>${p.price.toFixed(2)}</span>
                                  <button
                                      onClick={() =>
                                          handleAdd(
                                              p,
                                              category.restaurantId
                                          )
                                      }
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                        ))}
                  </div>
                </div>
            ))}
          </div>

          <div className="order-summary">
            <h3>Your Order</h3>
            {restaurantCart.length === 0 ? (
                <p className="empty">No items yet</p>
            ) : (
                restaurantCart.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-name">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                      <div className="order-controls">
                        <button onClick={() => handleQuantityChange(item.id, -1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                ))
            )}
            <div className="order-totals">
              <p>
                Subtotal <span>${subtotal.toFixed(2)}</span>
              </p>
              <p>
                Delivery Fee <span>${deliveryFee.toFixed(2)}</span>
              </p>
              <h4>
                Total <span>${total.toFixed(2)}</span>
              </h4>
            </div>
            <button
                className="checkout-btn"
                disabled={!restaurantCart.length}
                onClick={() =>
                    navigate(`/public/restaurants/${restaurantId}/checkout`)
                }
            >
              Checkout
            </button>
          </div>
        </div>

        {showReplaceCartModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Start a new order?</h3>
                <p>
                  Your cart contains items from another restaurant.
                  If you start a new order here, your current cart will be cleared.
                </p>
                <div className="modal-actions">
                  <button
                      className="btn-secondary"
                      onClick={cancelReplaceCart}
                  >
                    Keep current cart
                  </button>
                  <button
                      className="btn-primary"
                      onClick={confirmReplaceCart}
                  >
                    Start new order
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default RestaurantMenu;
