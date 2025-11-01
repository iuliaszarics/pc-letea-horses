import React, { useState, useEffect } from "react";
import RestaurantCard from "./RestaurantCard";
import "./RestaurantsListPage.css";

export default function RestaurantsListPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        filterRestaurants();
    }, [searchQuery, restaurants]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await fetch('/api/restaurants');
            // const data = await response.json();
            
            // Mock data for now
            const mockData = [
                {
                    id: "1",
                    name: "Burger Barn",
                    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
                    isOpen: true,
                    rating: 4.5
                },
                {
                    id: "2",
                    name: "Sushi Central",
                    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
                    isOpen: true,
                    rating: 4.8
                },
                {
                    id: "3",
                    name: "Pizza Palace",
                    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
                    isOpen: false,
                    rating: 4.2
                },
                {
                    id: "4",
                    name: "Taco Town",
                    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
                    isOpen: false,
                    rating: 4.6
                },
                {
                    id: "5",
                    name: "The Golden Spoon",
                    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
                    isOpen: true,
                    rating: 4.5
                },
                {
                    id: "6",
                    name: "Noodle House",
                    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
                    isOpen: true,
                    rating: 4.3
                }
            ];
            
            setRestaurants(mockData);
            setFilteredRestaurants(mockData);
            setError("");
        } catch (err) {
            setError("Failed to load restaurants. Please try again later.");
            console.error("Error fetching restaurants:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterRestaurants = () => {
        if (!searchQuery.trim()) {
            setFilteredRestaurants(restaurants);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(query)
        );
        setFilteredRestaurants(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    if (loading) {
        return (
            <div className="restaurants-page">
                <div className="loading">Loading restaurants...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="restaurants-page">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="restaurants-page">
            <div className="restaurants-container">
                <div className="page-header">
                    <h1 className="page-title">Our Restaurants</h1>
                    <p className="page-subtitle">Find the best food in your area</p>
                </div>

                <div className="search-section">
                    <div className="search-bar">
                        <svg
                            className="search-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or cuisine"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3 className="empty-title">No restaurants found</h3>
                        <p className="empty-message">
                            Try adjusting your search to find what you're looking for.
                        </p>
                    </div>
                ) : (
                    <div className="restaurants-grid">
                        {filteredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}