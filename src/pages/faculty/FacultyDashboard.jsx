import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FacultyLayout from "../../components/faculty/FacultyLayout";

function FacultyDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const role = localStorage.getItem("edumind_role");
        if (role !== "FACULTY") {
            navigate(role === "ADMIN" ? "/admin/dashboard" : "/faculty/login");
            return;
        }

        let cancelled = false;
        const loadPortal = async () => {
            try {
                const [profileResponse, coursesResponse] = await Promise.all([
                    api.get("/api/faculty/me"),
                    api.get("/api/faculty/me/courses")
                ]);
                if (!cancelled) {
                    setProfile(profileResponse.data);
                    setCourses(coursesResponse.data);
                }
            } catch (requestError) {
                console.error("Faculty dashboard error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load your faculty portal."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadPortal();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    if (loading) {
        return (
            <FacultyLayout>
                <div className="loading" role="status">Loading faculty dashboard...</div>
            </FacultyLayout>
        );
    }

    if (error) {
        return (
            <FacultyLayout>
                <div className="page-container">
                    <div className="error-message" role="alert">{error}</div>
                </div>
            </FacultyLayout>
        );
    }

    return (
        <FacultyLayout>
            <div className="dashboard-page">
                <header className="dashboard-header">
                    <div>
                        <h1>Faculty Dashboard</h1>
                        <p>Welcome, {profile.fullName}</p>
                    </div>
                    <div className="header-right">
                        <span>{profile.employeeId}</span>
                    </div>
                </header>

                <main className="dashboard-content">
                    <h2>My Profile</h2>
                    <section className="faculty-profile-card" aria-label="Faculty profile">
                        <div>
                            <span className="faculty-profile-label">Name</span>
                            <strong>{profile.fullName}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Employee ID</span>
                            <strong>{profile.employeeId}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Designation</span>
                            <strong>{profile.designation}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Department</span>
                            <strong>{profile.departmentName} ({profile.departmentCode})</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Email</span>
                            <strong>{profile.email || "Not provided"}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Username</span>
                            <strong>{profile.username}</strong>
                        </div>
                    </section>

                    <div className="faculty-section-heading">
                        <h2>Assigned Courses</h2>
                        <span className="faculty-course-count">
                            {courses.length} {courses.length === 1 ? "course" : "courses"}
                        </span>
                    </div>

                    {courses.length === 0 ? (
                        <div className="faculty-empty-state">
                            You do not have any courses assigned yet.
                        </div>
                    ) : (
                        <div className="faculty-course-grid">
                            {courses.map((course) => (
                                <article className="faculty-course-card" key={course.id}>
                                    <div className="faculty-course-card-header">
                                        <span className="faculty-course-code">{course.code}</span>
                                        <span className="faculty-course-credits">
                                            {course.credits} {course.credits === 1 ? "credit" : "credits"}
                                        </span>
                                    </div>
                                    <h3>{course.name}</h3>
                                    <p>
                                        Semester {course.semesterNumber} · {course.programName}
                                    </p>
                                    <span className="faculty-course-year">
                                        Academic year {course.academicYear}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </FacultyLayout>
    );
}

export default FacultyDashboard;
