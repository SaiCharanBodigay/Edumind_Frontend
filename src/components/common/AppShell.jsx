import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon, EduMindWordmark } from "./Icons";

export function AppShell({ role, portalName, navItems, children }) {
    const navigate = useNavigate();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem("edumind_sidebar_collapsed") === "true";
    });

    useEffect(() => {
        if (!isMobileOpen) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setIsMobileOpen(false);
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isMobileOpen]);

    const username = localStorage.getItem("edumind_username") || "User";
    const userRole = localStorage.getItem("edumind_role") || role;

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem("edumind_sidebar_collapsed", String(next));
            return next;
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("edumind_token");
        localStorage.removeItem("edumind_role");
        localStorage.removeItem("edumind_username");

        const redirect = {
            ADMIN: "/admin/login",
            FACULTY: "/faculty/login",
            STUDENT: "/student/login"
        }[role] || "/admin/login";

        navigate(redirect);
    };

    const roleColor = {
        ADMIN: "em-role-admin",
        FACULTY: "em-role-faculty",
        STUDENT: "em-role-student"
    }[role] || "em-role-admin";

    return (
        <div className={`em-app-shell ${isCollapsed ? "is-collapsed" : ""}`}>
            {/* Mobile Drawer Backdrop */}
            {isMobileOpen && (
                <div
                    className="em-drawer-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside
                className={`em-sidebar ${isMobileOpen ? "mobile-open" : ""}`}
                aria-label={`${portalName} navigation`}
                id="edumind-primary-navigation"
            >
                {/* Brand Header */}
                <div className="em-sidebar-header">
                    <EduMindWordmark compact={isCollapsed} />
                    <button
                        type="button"
                        className="em-drawer-close"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close navigation"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>

                <div className="em-portal-indicator">
                    <span className={`em-portal-dot ${roleColor}`} />
                    {!isCollapsed && <span className="em-portal-name">{portalName}</span>}
                </div>

                {/* Navigation Links */}
                <nav className="em-sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setIsMobileOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `em-nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="em-nav-icon">
                                <Icon name={item.icon || "file"} size={18} />
                            </span>
                            {!isCollapsed && (
                                <span className="em-nav-label">{item.label}</span>
                            )}
                            {item.badge && !isCollapsed && (
                                <span className="em-nav-badge">{item.badge}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Bottom / Profile Card */}
                <div className="em-sidebar-footer">
                    <div className="em-user-profile-card">
                        <div className="em-user-avatar" title={username}>
                            {username.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="em-user-details">
                                <span className="em-user-name">{username}</span>
                                <span className={`em-user-role-badge ${roleColor}`}>
                                    {userRole}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="em-logout-action"
                        onClick={handleLogout}
                        title="Sign out of EduMind"
                        aria-label="Sign out"
                    >
                        <Icon name="logout" size={16} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="em-main-wrapper">
                {/* Top Navigation Bar */}
                <header className="em-topbar">
                    <div className="em-topbar-left">
                        {/* Mobile Hamburger */}
                        <button
                            type="button"
                            className="em-mobile-toggle"
                            onClick={() => setIsMobileOpen(true)}
                            aria-label="Open mobile navigation menu"
                            aria-expanded={isMobileOpen}
                            aria-controls="edumind-primary-navigation"
                        >
                            <Icon name="menu" size={20} />
                        </button>

                        {/* Desktop Collapse Toggle */}
                        <button
                            type="button"
                            className="em-collapse-toggle"
                            onClick={toggleCollapse}
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Icon
                                name={isCollapsed ? "chevron-right" : "chevron-left"}
                                size={16}
                            />
                        </button>

                        <div className="em-topbar-brand">
                            <span className="em-topbar-title">{portalName}</span>
                        </div>
                    </div>

                    <div className="em-topbar-right">
                        <div className="em-status-pill">
                            <span className="em-status-dot pulse" />
                            <span className="em-status-label">Active Session</span>
                        </div>

                        <div className="em-topbar-user">
                            <div className="em-topbar-avatar">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className="em-topbar-username">{username}</span>
                        </div>

                        <button
                            type="button"
                            className="em-topbar-logout"
                            onClick={handleLogout}
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <Icon name="logout" size={15} />
                        </button>
                    </div>
                </header>

                {/* Page Content Body */}
                <main className="em-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
