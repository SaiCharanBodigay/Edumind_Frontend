import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FacultyLayout from "../../components/faculty/FacultyLayout";

function FacultyCourses() {
    const navigate = useNavigate();
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
        const loadCourses = async () => {
            try {
                const response = await api.get("/api/faculty/me/courses");
                if (!cancelled) {
                    setCourses(response.data);
                }
            } catch (requestError) {
                console.error("Faculty courses error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load your assigned courses."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCourses();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    return (
        <FacultyLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>My Courses</h1>
                        <p>Courses assigned to your faculty account</p>
                    </div>
                    {!loading && !error && (
                        <span className="faculty-course-count">
                            {courses.length} {courses.length === 1 ? "course" : "courses"}
                        </span>
                    )}
                </div>

                {loading && <div className="loading" role="status">Loading your courses...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {!loading && !error && courses.length === 0 && (
                    <div className="faculty-empty-state">
                        You do not have any courses assigned yet.
                    </div>
                )}
                {!loading && !error && courses.length > 0 && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Credits</th>
                                    <th>Semester</th>
                                    <th>Program</th>
                                    <th>Academic Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.code}</td>
                                        <td>{course.name}</td>
                                        <td>{course.credits}</td>
                                        <td>{course.semesterNumber}</td>
                                        <td>{course.programName} ({course.programCode})</td>
                                        <td>{course.academicYear}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
}

export default FacultyCourses;
