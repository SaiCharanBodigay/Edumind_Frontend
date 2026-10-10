import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function formatDate(value) {
    return new Date(value).toLocaleString();
}

function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get("/api/student/assignments")
            .then((response) => {
                if (!cancelled) setAssignments(response.data);
            })
            .catch((requestError) => {
                console.error("Student assignments error:", requestError);
                if (!cancelled) {
                    setError(requestError.response?.data?.message
                        || "Unable to load your assignments.");
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
                        <h1>Assignments</h1>
                        <p>Course work and submission status for your current semester.</p>
                    </div>
                </div>
                {loading && <div className="loading" role="status">Loading assignments...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {!loading && !error && assignments.length === 0 && (
                    <div className="faculty-empty-state">
                        There are no assignments for your courses.
                    </div>
                )}
                {!loading && !error && assignments.length > 0 && (
                    <div className="assignment-list">
                        {assignments.map((assignment) => (
                            <article className="assignment-card" key={assignment.id}>
                                <div className="assignment-card-content">
                                    <span className="faculty-course-code">
                                        {assignment.courseCode} · {assignment.courseName}
                                    </span>
                                    <h3>{assignment.title}</h3>
                                    <p>{assignment.description || "No description provided."}</p>
                                    <span>
                                        Due {formatDate(assignment.dueAt)} · {assignment.maxMarks} marks
                                    </span>
                                </div>
                                <div className="student-assignment-status">
                                    <strong className={`assignment-status ${assignment.submissionStatus.toLowerCase()}`}>
                                        {assignment.submissionStatus.replaceAll("_", " ")}
                                    </strong>
                                    <Link
                                        className="student-course-link"
                                        to={`/student/assignments/${assignment.id}`}
                                    >
                                        Open assignment
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentAssignments;
