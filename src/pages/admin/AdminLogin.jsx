import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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

            if (data.role !== "ADMIN" && data.role !== "FACULTY") {
                setMessage("This account does not have portal access.");
                return;
            }

            // Store authentication information
            localStorage.setItem("edumind_token", data.token);
            localStorage.setItem("edumind_role", data.role);
            localStorage.setItem("edumind_username", data.username);

            navigate(
                data.role === "FACULTY"
                    ? "/faculty/dashboard"
                    : "/admin/dashboard"
            );

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

                <div className="login-header">
                    <h1>EduMind</h1>
                    <p>Learning Portal</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {message && (
                        <div className="error-message">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default AdminLogin;