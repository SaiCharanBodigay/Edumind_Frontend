import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentDashboard() {
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            api.get("/api/student/me"),
            api.get("/api/student/me/courses")
        ])
            .then(([profileResponse, coursesResponse]) => {
                if (!cancelled) {
                    setProfile(profileResponse.data);
                    setCourses(coursesResponse.data);
                }
            })
            .catch((requestError) => {
                console.error("Student dashboard error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load your student dashboard."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const materialCount = courses.reduce(
        (total, course) => total + course.learningMaterialCount,
        0
    );

    return (
        <StudentLayout>
            <div className="dashboard-page">
                <header className="dashboard-header">
                    <div>
                        <h1>Student Dashboard</h1>
                        {profile && <p>Welcome, {profile.fullName}</p>}
                    </div>
                    {profile && <div className="header-right">{profile.rollNumber}</div>}
                </header>

                <main className="dashboard-content">
                    {loading && <div className="loading" role="status">Loading your dashboard...</div>}
                    {error && <div className="error-message" role="alert">{error}</div>}
                    {!loading && !error && profile && (
                        <>
                            <h2>My Profile</h2>
                            <section className="faculty-profile-card" aria-label="Student profile">
                                <div>
                                    <span className="faculty-profile-label">Name</span>
                                    <strong>{profile.fullName}</strong>
                                </div>
                                <div>
                                    <span className="faculty-profile-label">Roll Number</span>
                                    <strong>{profile.rollNumber}</strong>
                                </div>
                                <div>
                                    <span className="faculty-profile-label">Department</span>
                                    <strong>{profile.departmentName} ({profile.departmentCode})</strong>
                                </div>
                                <div>
                                    <span className="faculty-profile-label">Program</span>
                                    <strong>{profile.programName} ({profile.programCode})</strong>
                                </div>
                                <div>
                                    <span className="faculty-profile-label">Current Semester</span>
                                    <strong>Semester {profile.semesterNumber} · {profile.academicYear}</strong>
                                </div>
                                <div>
                                    <span className="faculty-profile-label">Email</span>
                                    <strong>{profile.email || "Not provided"}</strong>
                                </div>
                            </section>

                            <section className="student-summary-grid" aria-label="Academic summary">
                                <article className="stat-card">
                                    <h3>Available Courses</h3>
                                    <p>{courses.length}</p>
                                </article>
                                <article className="stat-card">
                                    <h3>Learning Materials</h3>
                                    <p>{materialCount}</p>
                                </article>
                            </section>

                            <div className="faculty-section-heading student-course-heading">
                                <h2>Available Courses</h2>
                                <Link to="/student/courses">View all courses</Link>
                            </div>
                            {courses.length === 0 ? (
                                <div className="faculty-empty-state">
                                    No courses are available for your current semester.
                                </div>
                            ) : (
                                <div className="faculty-course-grid">
                                    {courses.slice(0, 3).map((course) => (
                                        <article className="faculty-course-card" key={course.id}>
                                            <div className="faculty-course-card-header">
                                                <span className="faculty-course-code">{course.code}</span>
                                                <span className="faculty-course-credits">
                                                    {course.credits} {course.credits === 1 ? "credit" : "credits"}
                                                </span>
                                            </div>
                                            <h3>{course.name}</h3>
                                            <p>
                                                Semester {course.semesterNumber} · {course.academicYear}
                                            </p>
                                            <span className="faculty-course-year">
                                                {course.learningMaterialCount} learning materials
                                            </span>
                                            <Link
                                                className="student-course-link"
                                                to={`/student/courses/${course.id}`}
                                            >
                                                View course materials
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </StudentLayout>
    );
}

export default StudentDashboard;
