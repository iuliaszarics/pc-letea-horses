import React, { useState, useEffect, useRef } from "react";
import RestaurantCard from "./RestaurantCard";
import "./RestaurantsListPage.css";
import { getPublicRestaurantsAPI } from "../../../services/restaurantService";

export default function RestaurantsListPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const searchInputRef = useRef(null);

    // Debounce search - only fetch after user stops typing for 500ms
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRestaurants();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, pageNumber]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            
            const result = await getPublicRestaurantsAPI({
                searchKey: searchQuery.trim() || undefined,
                pageSize,
                pageNumber,
            });

            if (result.succeeded) {
                setRestaurants(result.restaurants || []);
                setFilteredRestaurants(result.restaurants || []);
                setTotalCount(result.totalCount || 0);
                setError("");
                
                // Restore focus to search input after fetch
                if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
                    setTimeout(() => {
                        searchInputRef.current?.focus();
                    }, 0);
                }
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

    if (loading && restaurants.length === 0) {
        return (
            <div className="restaurants-page">
                <div className="loading">Loading restaurants...</div>
            </div>
        );
    }

    if (error && restaurants.length === 0) {
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
                            ref={searchInputRef}
                            type="text"
                            className="search-input"
                            placeholder="Search by name or cuisine"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            autoFocus
                        />
                        {loading && restaurants.length > 0 && (
                            <div className="search-loading">Searching...</div>
                        )}
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