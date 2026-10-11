import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get("/api/student/quizzes")
            .then((response) => {
                if (!cancelled) setQuizzes(response.data);
            })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message
                    || "Unable to load quizzes.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header">
                    <div><h1>Quizzes</h1><p>Assessments for your authorized courses.</p></div>
                </div>
                {loading && <div className="loading" role="status">Loading quizzes...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {!loading && !error && quizzes.length === 0 && (
                    <div className="faculty-empty-state">There are no published quizzes for your courses.</div>
                )}
                {!loading && quizzes.map((quiz) => (
                    <article className="quiz-management-card" key={quiz.id}>
                        <div>
                            <span className="faculty-course-code">{quiz.courseCode} · {quiz.courseName}</span>
                            <h2>{quiz.title}</h2>
                            <p>{quiz.description || "No description provided."}</p>
                            <p>{quiz.totalMarks} marks · {quiz.durationMinutes
                                ? `${quiz.durationMinutes} minutes` : "Untimed"} · {quiz.attemptsUsed}/{quiz.maxAttempts} attempts</p>
                            <strong className={`quiz-status ${quiz.availability.toLowerCase()}`}>
                                {quiz.availability.replaceAll("_", " ")}
                            </strong>
                        </div>
                        <Link className="primary-button" to={`/student/quizzes/${quiz.id}`}>
                            Open quiz
                        </Link>
                    </article>
                ))}
            </div>
        </StudentLayout>
    );
}

export default StudentQuizzes;
