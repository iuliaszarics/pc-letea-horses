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
                <img 
                    src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"} 
                    alt={restaurant.name} 
                />
                <span className={`status-badge ${restaurant.isOpen ? 'open' : 'closed'}`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                </span>
            </div>
            <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-cuisine">{restaurant.cuisineType}</p>
            </div>
        </div>
    );
}