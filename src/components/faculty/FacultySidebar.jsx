import { NavLink, useNavigate } from "react-router-dom";

function FacultySidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("edumind_token");
        localStorage.removeItem("edumind_role");
        localStorage.removeItem("edumind_username");
        navigate("/faculty/login");
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <h1>EduMind</h1>
                <span>Faculty Portal</span>
            </div>

            <nav className="sidebar-nav" aria-label="Faculty navigation">
                <NavLink
                    to="/faculty/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/faculty/courses"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    My Courses
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-user">
                    {localStorage.getItem("edumind_username")}
                </div>
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default FacultySidebar;
