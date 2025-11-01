import React from "react";
import { useNavigate } from "react-router";
import "./RestaurantCard.css";

export default function RestaurantCard({ restaurant }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/public/restaurants/${restaurant.id}`);
    };

    return (
        <div className="restaurant-card" onClick={handleClick}>
            <div className="restaurant-image">
                <img src={restaurant.image} alt={restaurant.name} />
                <span className={`status-badge ${restaurant.isOpen ? 'open' : 'closed'}`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                </span>
            </div>
            <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                {restaurant.rating && (
                    <div className="restaurant-rating">
                        <span className="star">⭐</span>
                        <span>{restaurant.rating}</span>
                    </div>
                )}
            </div>
        </div>
    );
}