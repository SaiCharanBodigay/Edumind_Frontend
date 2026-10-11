import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Icon, EduMindWordmark } from "../../components/common/Icons";
import { DemoCredentialsModal } from "../../components/common/DemoCredentialsModal";

function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [demoModalOpen, setDemoModalOpen] = useState(false);

    // Staging environment flag: only show demo help button if explicitly enabled
    const showDemoCredentials = import.meta.env.VITE_SHOW_DEMO_CREDENTIALS === "true";

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!username.trim()) {
            setMessage("Please enter your username.");
            return;
        }

        if (!password) {
            setMessage("Please enter your password.");
            return;
        }

        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                username: username.trim(),
                password,
            });

            const data = response.data;
            const role = data.role?.toUpperCase();

            if (!["ADMIN", "FACULTY", "STUDENT"].includes(role)) {
                setMessage("This account does not have authorized portal access.");
                return;
            }

            // Store authentication state
            localStorage.setItem("edumind_token", data.token);
            localStorage.setItem("edumind_role", role);
            localStorage.setItem("edumind_username", data.username);

            const landingPage = {
                ADMIN: "/admin/dashboard",
                FACULTY: "/faculty/dashboard",
                STUDENT: "/student/dashboard"
            };

            navigate(landingPage[role] || "/admin/dashboard");

        } catch (error) {
            console.error("Login error:", error);

            if (!error.response) {
                setMessage("Unable to connect to EduMind server. Please verify backend availability.");
            } else if (error.response.status === 401 || error.response.status === 403) {
                setMessage("Invalid username or password. Please try again.");
            } else {
                setMessage(
                    error.response.data?.message ||
                    "Authentication failed. Please verify your credentials."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePrefillDemo = (demoUser, demoPass) => {
        setUsername(demoUser);
        setPassword(demoPass);
        setMessage("");
    };

    return (
        <div className="em-login-container">
            <div className="em-login-wrapper">
                {/* Brand Showcase Side */}
                <div className="em-login-brand-panel">
                    <div className="em-brand-panel-inner">
                        <EduMindWordmark />

                        <div className="em-hero-copy">
                            <span className="em-hero-pill">
                                <Icon name="sparkles" size={14} />
                                <span>Next-Gen Campus LMS</span>
                            </span>
                            <h1>Learn smarter.<br />Achieve more.</h1>
                            <p>
                                A unified university platform orchestrating academic cohorts,
                                learning materials, assignment grading, and timed assessments.
                            </p>
                        </div>

                        <div className="em-feature-cards">
                            <div className="em-feat-card">
                                <div className="em-feat-icon">
                                    <Icon name="structure" size={18} />
                                </div>
                                <div>
                                    <h4>Academic Hierarchy</h4>
                                    <p>Structured departments, cohorts, sections, and allocations.</p>
                                </div>
                            </div>

                            <div className="em-feat-card">
                                <div className="em-feat-icon">
                                    <Icon name="clipboard-list" size={18} />
                                </div>
                                <div>
                                    <h4>Coursework & Grading</h4>
                                    <p>Submissions, file storage, rubric feedback, and rosters.</p>
                                </div>
                            </div>

                            <div className="em-feat-card">
                                <div className="em-feat-icon">
                                    <Icon name="clock" size={18} />
                                </div>
                                <div>
                                    <h4>Timed Assessments</h4>
                                    <p>Question randomization, timer countdowns, and released results.</p>
                                </div>
                            </div>
                        </div>

                        <div className="em-brand-panel-footer">
                            <span>EduMind Enterprise Academic Architecture</span>
                        </div>
                    </div>
                </div>

                {/* Authentication Form Side */}
                <div className="em-login-form-panel">
                    <div className="em-login-form-box">
                        <div className="em-login-card-header">
                            <div className="em-login-mobile-brand">
                                <EduMindWordmark compact />
                            </div>
                            <span className="em-eyebrow">Portal Authentication</span>
                            <h2>Sign in to EduMind</h2>
                            <p>Access your Admin, Faculty, or Student workspace.</p>
                        </div>

                        <form onSubmit={handleLogin} noValidate className="em-login-form">
                            <div className="em-form-field">
                                <label htmlFor="username">Username or Roll Number</label>
                                <div className="em-input-wrapper">
                                    <span className="em-input-icon">
                                        <Icon name="user" size={17} />
                                    </span>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="e.g. admin or 24EG105K10"
                                        autoComplete="username"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div className="em-form-field">
                                <label htmlFor="password">Password</label>
                                <div className="em-input-wrapper">
                                    <span className="em-input-icon">
                                        <Icon name="key" size={17} />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your account password"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="em-password-reveal"
                                        onClick={() => setShowPassword((curr) => !curr)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className="em-login-alert" role="alert">
                                    <Icon name="alert-circle" size={16} />
                                    <span>{message}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="em-btn-primary em-btn-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="em-spinner" aria-hidden="true" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <Icon name="chevron-right" size={16} />
                                    </>
                                )}
                            </button>

                            {/* Help / Demo Login secondary button */}
                            {showDemoCredentials && (
                                <div className="em-demo-login-area">
                                    <button
                                        type="button"
                                        className="em-btn-secondary em-btn-full em-demo-trigger"
                                        onClick={() => setDemoModalOpen(true)}
                                    >
                                        <Icon name="help-circle" size={16} />
                                        <span>Help / Demo Login</span>
                                    </button>
                                    <span className="em-demo-caption">
                                        Staging accounts for evaluator verification
                                    </span>
                                </div>
                            )}
                        </form>

                        <div className="em-login-trust-footer">
                            <Icon name="shield" size={14} />
                            <span>Protected by JWT and Spring Security 6</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staging Demo Credentials Accessible Dialog */}
            <DemoCredentialsModal
                isOpen={demoModalOpen}
                onClose={() => setDemoModalOpen(false)}
                onSelectCredentials={handlePrefillDemo}
            />
        </div>
    );
}

export default AdminLogin;