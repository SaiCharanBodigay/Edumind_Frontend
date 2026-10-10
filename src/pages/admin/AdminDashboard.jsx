import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminDashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem("edumind_role");

        if (role !== "ADMIN") {
            navigate("/admin/login");
            return;
        }

        const loadDashboard = async () => {
            try {
                const response = await api.get("/api/admin/dashboard");
                setDashboard(response.data);
            } catch (error) {
                console.error("Dashboard error:", error);
                setError("Unable to load Admin Dashboard.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading">
                    Loading dashboard...
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="error-message">
                    {error}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="dashboard-page">

                <header className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome to the EduMind Admin Portal</p>
                    </div>

                    <div className="header-right">
                        <span>
                            {localStorage.getItem("edumind_username")}
                        </span>
                    </div>
                </header>

                <main className="dashboard-content">

                    <h2>System Overview</h2>

                    <div className="stats-grid">

                        <div className="stat-card">
                            <h3>Students</h3>
                            <p>{dashboard.students}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Faculty</h3>
                            <p>{dashboard.faculty}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Departments</h3>
                            <p>{dashboard.departments}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Programs</h3>
                            <p>{dashboard.programs}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Courses</h3>
                            <p>{dashboard.courses}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Academic Years</h3>
                            <p>{dashboard.academicYears}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Semesters</h3>
                            <p>{dashboard.semesters}</p>
                        </div>

                        <div className="stat-card">
                            <h3>Faculty Allocations</h3>
                            <p>{dashboard.facultyCourseAllocations}</p>
                        </div>

                    </div>

                </main>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;