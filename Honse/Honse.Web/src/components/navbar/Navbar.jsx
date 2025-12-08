import { useState } from "react";
import {Link, NavLink} from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
    const { isLoggedIn, logoutUser, username } = useAuth();
    const [open, setOpen] = useState(false);

    function close() { setOpen(false); }

    return (
        <header className="nav-header">
            <div className="nav-container">
                <Link to="/" className="brand" onClick={close}>
                    <img src="/horse_logo.ico" alt="Honse logo" className="brand-logo" />
                    <span className="brand-name">Honse</span>
                </Link>

                <nav className={`nav ${open ? "open" : ""}`}>
                    {isLoggedIn() ? (
                        <>
                            <Link to="/products" className="nav-link" onClick={close}>
                                Manager mode
                            </Link>

                            <div className="nav-divider" />

                            {username ? <span className="user-chip">{username}</span> : null}

                            <button
                                className="btn btn-ghost"
                                onClick={() => { close(); logoutUser(); }}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/public/login" className="btn btn-ghost" onClick={close}>
                                Log in
                            </Link>
                            <Link to="/public/register" className="btn btn-primary" onClick={close}>
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
