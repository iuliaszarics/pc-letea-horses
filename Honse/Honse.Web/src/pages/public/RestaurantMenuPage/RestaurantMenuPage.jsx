import React, { useEffect, useState } from "react";
import "./RestaurantMenuPage.css";
import { getPublicRestaurantsMenu } from "../../../services/restaurantService";
import { useParams } from "react-router";

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("restaurantId from useParams:", restaurantId);
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

  const handleAdd = (product) => {
    setOrder((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id, delta) => {
    setOrder((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: p.quantity + delta } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const subtotal = order.reduce((sum, p) => sum + p.price * p.quantity, 0);
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
      {/* Header */}
      <div className="header">
        <img
          src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"} 
          alt={restaurant.name}
          className="header-img"
        />
        <div className="header-content">
          <h1>{restaurant.name}</h1>
          <p>Cuisine: {restaurant.cuisineType}</p>
          <p>{restaurant.description}</p>
          <div className="header-info">
            <span>⭐ 4.5 stars</span>
            <span>💵 ${deliveryFee} delivery fee</span>
            <span>⏱️ 20–30 min</span>
          </div>
        </div>
      </div>

      <div className="menu-layout">
        {/* Menu Section */}
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
                          <button onClick={() => handleAdd(p)}>Add</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Your Order</h3>
          {order.length === 0 ? (
            <p className="empty">No items yet</p>
          ) : (
            order.map((item) => (
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
          <button className="checkout-btn" disabled={!order.length}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
