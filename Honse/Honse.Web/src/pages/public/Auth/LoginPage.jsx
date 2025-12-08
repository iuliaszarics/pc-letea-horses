import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import "./Auth.css";

export default function LoginPage() {
    const { loginUser } = useAuth();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        if (!usernameOrEmail || !password) {
            setError("Please fill in both fields.");
            return;
        }
        setLoading(true);
        const res = await loginUser(usernameOrEmail.trim(), password);
        setLoading(false);
        if (res?.errorMessage || res?.succeeded === false) {
            setError(res.errorMessage || "Login failed.");
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-stack">

                <div className="auth-card">
                    <h1 className="auth-title">Login</h1>
                    <p className="auth-sub">Welcome back! Please enter your details.</p>

                    {error ? <div className="error">{error}</div> : null}

                    <form className="form-grid" onSubmit={onSubmit}>
                        <div className="input-row">
                            <label className="label">Email or Username</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter your email or username"
                                value={usernameOrEmail}
                                onChange={e => setUsernameOrEmail(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div className="input-row">
                            <label className="label">Password</label>
                            <div className="input-group">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(s => !s)}
                                    aria-label="Toggle password visibility"
                                    className="password-button"
                                >
                                    {showPw ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" width="18" height="18">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M3 3l18 18M9.88 9.88A3 3 0 0114.12 14.12M10.73 5.08A9 9 0 0121 12c-.82 1.45-1.93 2.73-3.24 3.79M6.76 6.21A9 9 0 003 12c.82 1.45 1.93 2.73 3.24 3.79M12 15a3 3 0 01-3-3"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" width="18" height="18">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? "Signing in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
