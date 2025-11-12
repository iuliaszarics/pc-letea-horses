import React, { useState, useEffect } from "react";
import RestaurantCard from "./RestaurantCard";
import "./RestaurantsListPage.css";
import { getRestaurantsAPI } from "../../../services/restaurantService";

export default function RestaurantsListPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchRestaurants();
    }, [pageNumber, searchQuery]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            
            const result = await getRestaurantsAPI({
                searchKey: searchQuery || undefined,
                isEnabled: true, // Only show enabled restaurants on public page
                pageSize,
                pageNumber,
            });

            if (result.succeeded) {
                setRestaurants(result.restaurants || []);
                setFilteredRestaurants(result.restaurants || []);
                setTotalCount(result.totalCount || 0);
                setError("");
            } else {
                setError(result.errorMessage || "Failed to load restaurants");
                setRestaurants([]);
                setFilteredRestaurants([]);
            }
        } catch (err) {
            setError("Failed to load restaurants. Please try again later.");
            console.error("Error fetching restaurants:", err);
            setRestaurants([]);
            setFilteredRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPageNumber(1); // Reset to first page on search
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchRestaurants();
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
                    <form onSubmit={handleSearchSubmit} className="search-bar">
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
                    </form>
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
                    <>
                        <div className="restaurants-grid">
                            {filteredRestaurants.map(restaurant => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>

                        {totalCount > pageSize && (
                            <div className="pagination">
                                <button
                                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                    disabled={pageNumber === 1}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                
                                <span className="pagination-info">
                                    Page {pageNumber} of {Math.ceil(totalCount / pageSize)}
                                </span>

                                <button
                                    onClick={() => setPageNumber(prev => 
                                        prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
                                    )}
                                    disabled={pageNumber >= Math.ceil(totalCount / pageSize)}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}