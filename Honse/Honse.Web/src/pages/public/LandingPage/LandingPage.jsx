import { Link } from "react-router";
import "./LandingPage.css";

export default function LandingPage() {

    return (
        <div className="landing-page">
            <div className="landing-navbar">
                <div className="landing-brand">
                    <img src="/horse_logo.ico" alt="Honse logo" className="landing-logo" />
                    <span className="landing-brand-name">Honse</span>
                </div>
            </div>

            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">
                        Delicious Food, Delivered
                        <br />
                        <span className="hero-subtitle-inline">Fast as a Horse</span>
                    </h1>
                    <p className="hero-description">
                        Watch restaurants gallop to your door. Cancel anytime.
                    </p>
                    
                    <div className="role-selection">
                        <a href="#client-section" className="role-button role-client">
                            <svg className="role-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>I am Client</span>
                        </a>
                        <a href="#owner-section" className="role-button role-owner">
                            <svg className="role-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>I am Owner</span>
                        </a>
                    </div>
                    
                    <p className="guest-notice">
                         Clients can browse and order without an account!
                    </p>
                </div>
                <div className="hero-gradient"></div>
            </section>

            <section id="client-section" className="scroll-section client-section">
                <div className="scroll-container">
                    <div className="scroll-text">
                        <p className="scroll-kicker">For Clients</p>
                        <h2 className="scroll-title">Order without an account</h2>
                        <p className="scroll-description">
                            Browse restaurants, search menus, add to cart, and place orders as a guest. Track delivery in real-time.
                        </p>
                        <div className="scroll-actions">
                            <Link to="/public/restaurants" className="feature-cta-button">
                                Start browsing
                                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link to="/public/restaurants" className="ghost-button">View restaurants</Link>
                        </div>
                        <ul className="scroll-list">
                            <li> Search cuisines & dishes instantly</li>
                            <li> Build your cart and customize items</li>
                            <li> Track delivery as it gallops to you</li>
                        </ul>
                    </div>
                </div>
            </section>


            <section id="owner-section" className="scroll-section owner-section">
                <div className="scroll-container">
                    <div className="scroll-text">
                        <p className="scroll-kicker">For Owners</p>
                        <h2 className="scroll-title">Grow with Honse</h2>
                        <p className="scroll-description">
                            Register your restaurant, manage menus and orders, and access manager mode to keep everything running smoothly.
                        </p>
                        <div className="scroll-actions">
                            <Link to="/register" className="feature-cta-button">
                                Register restaurant
                                <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link to="/login" className="ghost-button">Owner login</Link>
                        </div>
                        <ul className="scroll-list">
                            <li> Create & edit menus in minutes</li>
                            <li> Manage live orders and status</li>
                            <li> Access manager mode dashboard</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="final-cta">
                <div className="final-cta-content">
                    <h2 className="final-cta-title">Ready to order?</h2>
                    <Link to="/public/restaurants" className="btn-get-started btn-large">
                        Browse Restaurants
                        <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <img src="/horse_logo.ico" alt="Honse logo" className="footer-logo" />
                        <span className="footer-brand-name">Honse</span>
                    </div>
                    <div className="footer-links">
                        <Link to="/public/restaurants" className="footer-link">Restaurants</Link>
                        <Link to="/login" className="footer-link">For Businesses</Link>
                    </div>
                    <p className="footer-copyright">
                        © 2026 Honse. All rights reserved. 🐴
                    </p>
                </div>
            </footer>
        </div>
    );
}
