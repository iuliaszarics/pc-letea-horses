import React from "react";
import { useNavigate } from "react-router";
import "./RestaurantCard.css";

export default function RestaurantCard({ restaurant }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/public/restaurants/${restaurant.id}`);
    };

    // Check if restaurant is currently open based on opening/closing time
    const isOpen = () => {
        if (!restaurant.openingTime || !restaurant.closingTime) return false;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
        
        // Parse opening time (format: "HH:MM:SS")
        const [openHour, openMin] = restaurant.openingTime.split(':').map(Number);
        const openingMinutes = openHour * 60 + openMin;
        
        // Parse closing time
        const [closeHour, closeMin] = restaurant.closingTime.split(':').map(Number);
        const closingMinutes = closeHour * 60 + closeMin;
        
        return currentTime >= openingMinutes && currentTime <= closingMinutes;
    };

    return (
        <div className="restaurant-card" onClick={handleClick}>
            <div className="restaurant-image">
                <img 
                    src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"} 
                    alt={restaurant.name} 
                />
                <span className={`status-badge ${isOpen() ? 'open' : 'closed'}`}>
                    {isOpen() ? 'Open' : 'Closed'}
                </span>
            </div>
            <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-cuisine">{restaurant.cuisineType}</p>
                {restaurant.averageRating > 0 && (
                    <div className="restaurant-rating">
                        <span className="star">⭐</span>
                        <span>{restaurant.averageRating.toFixed(1)}</span>
                        <span className="review-count">({restaurant.totalReviews})</span>
                    </div>
                )}
            </div>
        </div>
    );
}