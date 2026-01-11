import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext.js";
import "./AccountSettingsPage.css";

const RAW_BASE = process.env.REACT_APP_API_URL || "https://localhost:2000";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._]+$/;

function getApiErrorMessage(err, fallback) {
    const data = err?.response?.data;
    if (data?.errorMessage) return data.errorMessage;
    if (typeof data === "string" && data.trim()) return data;
    return fallback;
}

function mapBackendErrorsToFields(errorMessage) {
    const fieldErrors = {
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    };

    if (!errorMessage || typeof errorMessage !== "string") return fieldErrors;

    const parts = errorMessage
        .split(/;|\n/g)
        .map((s) => s.trim())
        .filter(Boolean);

    for (const p of parts) {
        const lower = p.toLowerCase();

        if (lower.includes("username")) {
            fieldErrors.username = fieldErrors.username ? `${fieldErrors.username} ${p}` : p;
            continue;
        }

        if (lower.includes("email")) {
            fieldErrors.email = fieldErrors.email ? `${fieldErrors.email} ${p}` : p;
            continue;
        }

        if (lower.includes("current password")) {
            fieldErrors.currentPassword = fieldErrors.currentPassword
                ? `${fieldErrors.currentPassword} ${p}`
                : p;
            continue;
        }

        if (lower.includes("new password")) {
            fieldErrors.newPassword = fieldErrors.newPassword ? `${fieldErrors.newPassword} ${p}` : p;
            continue;
        }

        if (lower.includes("confirm") || lower.includes("match")) {
            fieldErrors.confirmNewPassword = fieldErrors.confirmNewPassword
                ? `${fieldErrors.confirmNewPassword} ${p}`
                : p;
            continue;
        }
    }

    return fieldErrors;
}

function EyeIcon({ open }) {
    return open ? (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M2.1 3.51 3.51 2.1 21.9 20.49 20.49 21.9l-3.02-3.02c-1.63.74-3.45 1.12-5.47 1.12C6.5 20 2.16 16.36 1 12c.53-1.99 1.73-3.78 3.41-5.19L2.1 3.51Zm8.3 8.3 3.79 3.79c-.55.25-1.16.4-1.79.4-2.21 0-4-1.79-4-4 0-.63.15-1.24.4-1.79ZM12 4c5.5 0 9.84 3.64 11 8-.5 1.9-1.6 3.62-3.12 5.01l-2.18-2.18c.19-.53.3-1.11.3-1.73 0-2.76-2.24-5-5-5-.62 0-1.2.11-1.73.3L9.3 6.43C10.18 6.15 11.08 4 12 4Zm0 6c1.66 0 3 1.34 3 3 0 .3-.05.58-.13.85l-3.72-3.72c.27-.08.55-.13.85-.13Z"
            />
        </svg>
    ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 4c5.5 0 9.84 3.64 11 8-1.16 4.36-5.5 8-11 8S2.16 16.36 1 12c1.16-4.36 5.5-8 11-8Zm0 14c3.86 0 7.17-2.33 8.4-6-1.23-3.67-4.54-6-8.4-6S4.83 8.33 3.6 12c1.23 3.67 4.54 6 8.4 6Zm0-10a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
            />
        </svg>
    );
}

export default function AccountSettingsPage() {
    const hydratedRef = useRef(false);

    const [profile, setProfile] = useState({ username: "", email: "" });
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState({ initial: true, profile: false, password: false });

    const [touched, setTouched] = useState({
        username: false,
        email: false,
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
    });

    const [errors, setErrors] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [showPw, setShowPw] = useState({
        current: false,
        next: false,
        confirm: false,
    });

    const { setAuthUsername } = useAuth();

    const setErrorBanner = (message) => setStatus({ type: "error", message });
    const setSuccessBanner = (message) => setStatus({ type: "success", message });

    function validateProfile(nextProfile) {
        const e = { username: "", email: "" };

        const u = (nextProfile.username || "").trim();
        const em = (nextProfile.email || "").trim();

        if (!u) e.username = "Username is required.";
        else if (u.length < 3) e.username = "Username must be at least 3 characters.";
        else if (u.length > 20) e.username = "Username must be at most 20 characters.";
        else if (/\s/.test(u)) e.username = "Username cannot contain spaces.";
        else if (!usernameRegex.test(u)) e.username = "Use only letters, numbers, dot, underscore.";

        if (!em) e.email = "Email is required.";
        else if (!emailRegex.test(em)) e.email = "Enter a valid email address.";

        return e;
    }

    function validatePasswords(nextPasswords) {
        const e = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

        const cur = nextPasswords.currentPassword || "";
        const np = nextPasswords.newPassword || "";
        const cnp = nextPasswords.confirmNewPassword || "";

        if (!cur) e.currentPassword = "Current password is required.";

        if (!np) e.newPassword = "New password is required.";
        else if (np.length < 8) e.newPassword = "New password must be at least 8 characters.";

        if (!cnp) e.confirmNewPassword = "Please confirm the new password.";
        else if (np !== cnp) e.confirmNewPassword = "Passwords do not match.";

        return e;
    }

    const profileErrors = useMemo(() => validateProfile(profile), [profile]);
    const passwordErrors = useMemo(() => validatePasswords(passwords), [passwords]);

    const isProfileValid = !profileErrors.username && !profileErrors.email;
    const isPasswordValid =
        !passwordErrors.currentPassword && !passwordErrors.newPassword && !passwordErrors.confirmNewPassword;

    useEffect(() => {
        setErrors((prev) => ({
            ...prev,
            username: profileErrors.username,
            email: profileErrors.email,
        }));
    }, [profileErrors]);

    useEffect(() => {
        setErrors((prev) => ({
            ...prev,
            currentPassword: passwordErrors.currentPassword,
            newPassword: passwordErrors.newPassword,
            confirmNewPassword: passwordErrors.confirmNewPassword,
        }));
    }, [passwordErrors]);

    function handleUnauthorized(err) {
        if (err?.response?.status === 401) {
            localStorage.removeItem("token");
            setErrorBanner("Session expired. Please log in again.");
            return true;
        }
        return false;
    }

    useEffect(() => {
        if (hydratedRef.current) return;

        (async () => {
            setStatus({ type: "", message: "" });

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setErrorBanner("No token found. Please log in again.");
                    return;
                }

                const res = await axios.get(`${RAW_BASE}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const me = res.data;

                setProfile({
                    username: (me.username ?? "").trim(),
                    email: (me.email ?? "").trim(),
                });

                hydratedRef.current = true;
            } catch (err) {
                if (handleUnauthorized(err)) return;

                const msg = getApiErrorMessage(err, "Failed to load your account details.");
                setErrorBanner(msg);
                console.error("ME ERROR:", err?.response?.status, err?.response?.data, err?.message);
            } finally {
                setLoading((s) => ({ ...s, initial: false }));
            }
        })();
    }, []);

    function markTouched(field) {
        setTouched((t) => ({ ...t, [field]: true }));
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setStatus({ type: "", message: "" });

        setTouched((t) => ({ ...t, username: true, email: true }));

        const eProfile = validateProfile(profile);
        if (eProfile.username || eProfile.email) return;

        setLoading((s) => ({ ...s, profile: true }));
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setErrorBanner("No token found. Please log in again.");
                return;
            }

            const res = await axios.put(
                `${RAW_BASE}/api/users/me`,
                {
                    UserName: profile.username.trim(),
                    Email: profile.email.trim(),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updated = res.data || {};
            setProfile({
                username: (updated.userName ?? updated.username ?? profile.username).trim(),
                email: (updated.email ?? profile.email).trim(),
            });

            setSuccessBanner("Profile updated successfully.");
            setAuthUsername(profile.username);
        } catch (err) {
            if (handleUnauthorized(err)) return;

            const msg = getApiErrorMessage(err, "Failed to update profile.");
            setErrorBanner(msg);

            const mapped = mapBackendErrorsToFields(msg);
            if (mapped.username || mapped.email) {
                setErrors((prev) => ({
                    ...prev,
                    username: mapped.username || prev.username,
                    email: mapped.email || prev.email,
                }));
            }
        } finally {
            setLoading((s) => ({ ...s, profile: false }));
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        setStatus({ type: "", message: "" });

        setTouched((t) => ({
            ...t,
            currentPassword: true,
            newPassword: true,
            confirmNewPassword: true,
        }));

        const ePw = validatePasswords(passwords);
        if (ePw.currentPassword || ePw.newPassword || ePw.confirmNewPassword) return;

        setLoading((s) => ({ ...s, password: true }));
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setErrorBanner("No token found. Please log in again.");
                return;
            }

            const res = await axios.post(
                `${RAW_BASE}/api/users/change-password`,
                {
                    CurrentPassword: passwords.currentPassword,
                    NewPassword: passwords.newPassword,
                    ConfirmNewPassword: passwords.confirmNewPassword,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
            setTouched((t) => ({
                ...t,
                currentPassword: false,
                newPassword: false,
                confirmNewPassword: false,
            }));

            setSuccessBanner(res.data?.message || "Password updated successfully.");
        } catch (err) {
            if (handleUnauthorized(err)) return;

            const msg = getApiErrorMessage(err, "Failed to change password.");
            setErrorBanner(msg);

            const mapped = mapBackendErrorsToFields(msg);
            if (mapped.currentPassword || mapped.newPassword || mapped.confirmNewPassword) {
                setErrors((prev) => ({
                    ...prev,
                    currentPassword: mapped.currentPassword || prev.currentPassword,
                    newPassword: mapped.newPassword || prev.newPassword,
                    confirmNewPassword: mapped.confirmNewPassword || prev.confirmNewPassword,
                }));
            }
        } finally {
            setLoading((s) => ({ ...s, password: false }));
        }
    }

    if (loading.initial) {
        return (
            <div className="settings-wrap">
                <div className="settings-container">
                    <div className="settings-card">
                        <h2 className="settings-card-title">Loading...</h2>
                        <p className="settings-card-sub">Fetching your account details.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-wrap">
            <div className="settings-container">
                <header className="settings-header">
                    <h1 className="settings-title">Account Settings</h1>
                    <p className="settings-sub">Manage your profile and security settings.</p>
                </header>

                {status.message && (
                    <div className={["alert", status.type === "success" ? "alert-success" : "alert-error"].join(" ")}>
                        {status.message}
                    </div>
                )}

                <div className="settings-grid">
                    <section className="settings-card">
                        <h2 className="settings-card-title">Profile</h2>
                        <p className="settings-card-sub">Update your account details.</p>

                        <form onSubmit={handleSaveProfile} className="form-grid" noValidate>
                            <div className="input-row">
                                <label className="label">Username</label>
                                <input
                                    className={["input", touched.username && errors.username ? "input-invalid" : ""].join(" ")}
                                    value={profile.username}
                                    onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                                    onBlur={() => markTouched("username")}
                                    placeholder="Username"
                                    autoComplete="username"
                                />
                                {touched.username && errors.username && <div className="field-error">{errors.username}</div>}
                            </div>

                            <div className="input-row">
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    className={["input", touched.email && errors.email ? "input-invalid" : ""].join(" ")}
                                    value={profile.email}
                                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                                    onBlur={() => markTouched("email")}
                                    placeholder="Email"
                                    autoComplete="email"
                                />
                                {touched.email && errors.email && <div className="field-error">{errors.email}</div>}
                            </div>

                            <div className="actions">
                                <button className="btn btn-primary" disabled={loading.profile || !isProfileValid}>
                                    {loading.profile ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="settings-card">
                        <h2 className="settings-card-title">Security</h2>
                        <p className="settings-card-sub">Change your password.</p>

                        <form onSubmit={handleChangePassword} className="form-grid" noValidate>
                            <div className="input-row">
                                <label className="label">Current password</label>

                                <div className="input-with-icon">
                                    <input
                                        type={showPw.current ? "text" : "password"}
                                        className={["input", touched.currentPassword && errors.currentPassword ? "input-invalid" : ""].join(" ")}
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords((p) => ({...p, currentPassword: e.target.value}))}
                                        onBlur={() => markTouched("currentPassword")}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        aria-label={showPw.current ? "Hide current password" : "Show current password"}
                                        onClick={() => setShowPw((s) => ({...s, current: !s.current}))}
                                    >
                                        <EyeIcon open={showPw.current}/>
                                    </button>
                                </div>

                                {touched.currentPassword && errors.currentPassword &&
                                    <div className="field-error">{errors.currentPassword}</div>}
                            </div>

                            <div className="input-row">
                                <label className="label">New password</label>

                                <div className="input-with-icon">
                                    <input
                                        type={showPw.next ? "text" : "password"}
                                        className={["input", touched.newPassword && errors.newPassword ? "input-invalid" : ""].join(" ")}
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords((p) => ({...p, newPassword: e.target.value}))}
                                        onBlur={() => markTouched("newPassword")}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        aria-label={showPw.next ? "Hide new password" : "Show new password"}
                                        onClick={() => setShowPw((s) => ({...s, next: !s.next}))}
                                    >
                                        <EyeIcon open={showPw.next}/>
                                    </button>
                                </div>

                                {touched.newPassword && errors.newPassword &&
                                    <div className="field-error">{errors.newPassword}</div>}
                            </div>

                            <div className="input-row">
                                <label className="label">Confirm new password</label>

                                <div className="input-with-icon">
                                    <input
                                        type={showPw.confirm ? "text" : "password"}
                                        className={["input", touched.confirmNewPassword && errors.confirmNewPassword ? "input-invalid" : ""].join(" ")}
                                        value={passwords.confirmNewPassword}
                                        onChange={(e) => setPasswords((p) => ({
                                            ...p,
                                            confirmNewPassword: e.target.value
                                        }))}
                                        onBlur={() => markTouched("confirmNewPassword")}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        aria-label={showPw.confirm ? "Hide confirm password" : "Show confirm password"}
                                        onClick={() => setShowPw((s) => ({...s, confirm: !s.confirm}))}
                                    >
                                        <EyeIcon open={showPw.confirm}/>
                                    </button>
                                </div>

                                {touched.confirmNewPassword && errors.confirmNewPassword && (
                                    <div className="field-error">{errors.confirmNewPassword}</div>
                                )}
                            </div>

                            <div className="actions">
                                <button className="btn btn-primary" disabled={loading.password || !isPasswordValid}>
                                    {loading.password ? "Updating..." : "Update password"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}
