import { NavLink, useNavigate } from "react-router-dom";

function StudentSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("edumind_token");
        localStorage.removeItem("edumind_role");
        localStorage.removeItem("edumind_username");
        navigate("/student/login");
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <h1>EduMind</h1>
                <span>Student Portal</span>
            </div>

            <nav className="sidebar-nav" aria-label="Student navigation">
                <NavLink
                    to="/student/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/student/courses"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    My Courses
                </NavLink>
                <NavLink
                    to="/student/assignments"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Assignments
                </NavLink>
                <NavLink
                    to="/student/profile"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Profile
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

export default StudentSidebar;
