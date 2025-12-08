import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import "./Navbar.css";

export default function Navbar() {
    const { isLoggedIn, logoutUser, username } = useAuth();
    const [open, setOpen] = useState(false);
    const { cart } = useCart();
    const navigate = useNavigate();

    function close() {
        setOpen(false);
    }

    const itemCount =
        cart?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    const cartRestaurantId = cart.length > 0 ? cart[0].restaurantId : null;

    const handleCartClick = () => {
        close();
        if (!cartRestaurantId) {
            return;
        }

        navigate(`/public/restaurants/${cartRestaurantId}`);
    };

    return (
        <header className="nav-header">
            <div className="nav-container">
                <Link to="/" className="brand" onClick={close}>
                    <img src="/horse_logo.ico" alt="Honse logo" className="brand-logo" />
                    <span className="brand-name">Honse</span>
                </Link>

                <nav className={`nav ${open ? "open" : ""}`}>
                    {itemCount > 0 && (
                        <button
                            type="button"
                            className="btn btn-primary btn-cart"
                            onClick={handleCartClick}
                        >
                            Cart <span>({itemCount})</span>
                        </button>
                    )}

                    {isLoggedIn() ? (
                        <>
                            <Link to="/products" className="nav-link" onClick={close}>
                                Manager mode
                            </Link>

                            <div className="nav-divider" />

                            {username ? <span className="user-chip">{username}</span> : null}

                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    close();
                                    logoutUser();
                                }}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/public/login" className="btn btn-ghost" onClick={close}>
                                Log in
                            </Link>
                            <Link
                                to="/public/register"
                                className="btn btn-primary"
                                onClick={close}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
