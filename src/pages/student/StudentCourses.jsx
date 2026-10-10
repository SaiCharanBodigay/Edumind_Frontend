import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get("/api/student/me/courses")
            .then((response) => {
                if (!cancelled) setCourses(response.data);
            })
            .catch((requestError) => {
                console.error("Student courses error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load your courses."
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

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>My Courses</h1>
                        <p>Courses available in your current semester.</p>
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
                        No courses are available for your current semester.
                    </div>
                )}
                {!loading && !error && courses.length > 0 && (
                    <div className="student-course-grid">
                        {courses.map((course) => (
                            <article className="faculty-course-card" key={course.id}>
                                <div className="faculty-course-card-header">
                                    <span className="faculty-course-code">{course.code}</span>
                                    <span className="faculty-course-credits">
                                        {course.credits} {course.credits === 1 ? "credit" : "credits"}
                                    </span>
                                </div>
                                <h3>{course.name}</h3>
                                <p>Semester {course.semesterNumber} · {course.programName}</p>
                                <span className="faculty-course-year">
                                    Academic year {course.academicYear}
                                </span>
                                <p className="student-course-faculty">
                                    Faculty: {course.facultyNames.length > 0
                                        ? course.facultyNames.join(", ")
                                        : "Not assigned"}
                                </p>
                                <p className="student-course-faculty">
                                    {course.learningMaterialCount} learning materials
                                </p>
                                <Link
                                    className="student-course-link"
                                    to={`/student/courses/${course.id}`}
                                >
                                    Open course materials
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentCourses;
