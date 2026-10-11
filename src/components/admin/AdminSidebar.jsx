import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("edumind_token");
        localStorage.removeItem("edumind_role");
        localStorage.removeItem("edumind_username");

        navigate("/admin/login");
    };

    return (
        <aside className="admin-sidebar">

            <div className="sidebar-logo">
                <h1>EduMind</h1>
                <span>Admin Portal</span>
            </div>

            <nav className="sidebar-nav">

                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/students"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Students
                </NavLink>

                <NavLink
                    to="/admin/faculty"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Faculty
                </NavLink>

                <NavLink
                    to="/admin/departments"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Departments
                </NavLink>

                <NavLink
                    to="/admin/programs"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Programs
                </NavLink>

                <NavLink
                    to="/admin/academic-years"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Academic Years
                </NavLink>

                <NavLink
                    to="/admin/semesters"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Semesters
                </NavLink>

                <NavLink
                    to="/admin/academic-structure"
                    className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                    Cohorts &amp; Sections
                </NavLink>

                <NavLink
                    to="/admin/class-incharges"
                    className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                    Class Incharges
                </NavLink>

                <NavLink
                    to="/admin/courses"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Courses
                </NavLink>

                <NavLink
                    to="/admin/faculty-allocation"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Faculty Allocation
                </NavLink>

                <NavLink
                    to="/admin/bulk-import"
                    className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"
                    }
                >
                    Bulk Import
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

export default AdminSidebar;