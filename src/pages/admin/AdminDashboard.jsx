import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";
import { Icon } from "../../components/common/Icons";
import { PageHeader, LoadingSkeleton } from "../../components/common/UIComponents";

function AdminDashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const handleRetry = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/api/admin/dashboard");
            setDashboard(response.data);
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(err.response?.data?.message || "Unable to load Admin Dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem("edumind_role");

        if (role !== "ADMIN") {
            navigate("/admin/login");
            return;
        }

        let cancelled = false;
        api.get("/api/admin/dashboard")
            .then((response) => {
                if (!cancelled) {
                    setDashboard(response.data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Dashboard error:", err);
                    setError(err.response?.data?.message || "Unable to load Admin Dashboard.");
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const statCards = dashboard ? [
        {
            title: "Enrolled Students",
            value: dashboard.students,
            icon: "students",
            category: "Students",
            link: "/admin/students",
            color: "blue"
        },
        {
            title: "Faculty Members",
            value: dashboard.faculty,
            icon: "faculty",
            category: "Staff",
            link: "/admin/faculty",
            color: "indigo"
        },
        {
            title: "Academic Departments",
            value: dashboard.departments,
            icon: "department",
            category: "Academic",
            link: "/admin/departments",
            color: "teal"
        },
        {
            title: "Degree Programs",
            value: dashboard.programs,
            icon: "program",
            category: "Curriculum",
            link: "/admin/programs",
            color: "purple"
        },
        {
            title: "Catalog Courses",
            value: dashboard.courses,
            icon: "courses",
            category: "Curriculum",
            link: "/admin/courses",
            color: "cyan"
        },
        {
            title: "Academic Years",
            value: dashboard.academicYears,
            icon: "academic-year",
            category: "Calendar",
            link: "/admin/academic-years",
            color: "amber"
        },
        {
            title: "Semesters",
            value: dashboard.semesters,
            icon: "semester",
            category: "Calendar",
            link: "/admin/semesters",
            color: "orange"
        },
        {
            title: "Course Allocations",
            value: dashboard.facultyCourseAllocations,
            icon: "allocation",
            category: "Operations",
            link: "/admin/faculty-allocation",
            color: "emerald"
        }
    ] : [];

    return (
        <AdminLayout>
            <div className="em-page-container">
                <PageHeader
                    title="Executive Dashboard"
                    description="Real-time campus operational metrics and academic hierarchy overview."
                    breadcrumbs={[{ label: "Admin Portal" }, { label: "Dashboard" }]}
                    actions={
                        <Link to="/admin/bulk-import" className="primary-button">
                            <Icon name="import" size={16} />
                            <span>Bulk Import</span>
                        </Link>
                    }
                />

                {loading && (
                    <div className="em-stats-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <LoadingSkeleton key={i} lines={2} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="error-message" role="alert">
                        <Icon name="alert-circle" size={18} />
                        <div>
                            <strong>Dashboard Error:</strong> {error}
                        </div>
                        <button type="button" className="secondary-button btn-sm" onClick={handleRetry}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && dashboard && (
                    <>
                        <section className="em-metrics-section">
                            <h2 className="em-section-title">Institutional Overview</h2>
                            <div className="em-stats-grid">
                                {statCards.map((stat) => (
                                    <div key={stat.title} className={`em-stat-card card-${stat.color}`}>
                                        <div className="em-stat-top">
                                            <span className="em-stat-category">{stat.category}</span>
                                            <span className={`em-stat-icon-wrap icon-${stat.color}`}>
                                                <Icon name={stat.icon} size={20} />
                                            </span>
                                        </div>
                                        <div className="em-stat-num">{stat.value}</div>
                                        <div className="em-stat-title">{stat.title}</div>
                                        <Link to={stat.link} className="em-stat-link">
                                            <span>Manage records</span>
                                            <Icon name="chevron-right" size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="em-admin-quick-links-section">
                            <h2 className="em-section-title">Core Administration Portals</h2>
                            <div className="em-quick-grid">
                                <Link to="/admin/academic-structure" className="em-quick-card">
                                    <div className="em-quick-icon">
                                        <Icon name="structure" size={22} />
                                    </div>
                                    <div className="em-quick-content">
                                        <h3>Cohorts &amp; Sections</h3>
                                        <p>Manage student grouping cohorts, section quotas, and enrollment placements.</p>
                                    </div>
                                    <Icon name="chevron-right" size={16} className="em-quick-arrow" />
                                </Link>

                                <Link to="/admin/class-incharges" className="em-quick-card">
                                    <div className="em-quick-icon">
                                        <Icon name="class-incharge" size={22} />
                                    </div>
                                    <div className="em-quick-content">
                                        <h3>Class Incharge Appointments</h3>
                                        <p>Designate responsible faculty incharge leaders for academic cohorts and sections.</p>
                                    </div>
                                    <Icon name="chevron-right" size={16} className="em-quick-arrow" />
                                </Link>

                                <Link to="/admin/faculty-allocation" className="em-quick-card">
                                    <div className="em-quick-icon">
                                        <Icon name="allocation" size={22} />
                                    </div>
                                    <div className="em-quick-content">
                                        <h3>Faculty Teaching Allocations</h3>
                                        <p>Assign qualified instructors to departmental courses and active sections.</p>
                                    </div>
                                    <Icon name="chevron-right" size={16} className="em-quick-arrow" />
                                </Link>

                                <Link to="/admin/bulk-import" className="em-quick-card">
                                    <div className="em-quick-icon">
                                        <Icon name="import" size={22} />
                                    </div>
                                    <div className="em-quick-content">
                                        <h3>Batch Data Ingestion</h3>
                                        <p>Import comprehensive student rolls and faculty directories via CSV or Excel.</p>
                                    </div>
                                    <Icon name="chevron-right" size={16} className="em-quick-arrow" />
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;