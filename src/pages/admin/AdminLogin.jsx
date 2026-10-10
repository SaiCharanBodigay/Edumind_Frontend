import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                username,
                password,
            });

            const data = response.data;

            const role = data.role?.toUpperCase();
            if (!["ADMIN", "FACULTY", "STUDENT"].includes(role)) {
                setMessage("This account does not have portal access.");
                return;
            }

            // Store authentication information
            localStorage.setItem("edumind_token", data.token);
            localStorage.setItem("edumind_role", role);
            localStorage.setItem("edumind_username", data.username);

            const landingPage = {
                ADMIN: "/admin/dashboard",
                FACULTY: "/faculty/dashboard",
                STUDENT: "/student/dashboard"
            };
            navigate(landingPage[role]);

        } catch (error) {
            console.error("Login error:", error);

            setMessage(
                error.response?.data?.message ||
                "Unable to connect to EduMind server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand-panel">
                    <div className="brand-mark">E</div>
                    <span className="login-badge">Learning platform</span>
                    <h1>EduMind</h1>
                    <p>
                        Manage students, faculty, and learning journeys in one premium campus experience.
                    </p>

                    <ul className="login-feature-list">
                        <li>Unified academic operations</li>
                        <li>Student-centered course delivery</li>
                        <li>Secure role-based access</li>
                    </ul>
                </div>

                <div className="login-form-panel">
                    <div className="login-header">
                        <span className="eyebrow">Welcome back</span>
                        <h2>Sign in to your portal</h2>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-field">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="error-message" role="alert">
                                {message}
                            </div>
                        )}

                        <button type="submit" className="primary-button login-submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;