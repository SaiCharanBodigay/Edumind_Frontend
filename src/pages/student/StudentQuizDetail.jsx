import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentQuizDetail() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");

    const loadQuiz = async () => {
        const response = await api.get(`/api/student/quizzes/${quizId}`);
        setQuiz(response.data);
    };

    useEffect(() => {
        let cancelled = false;
        api.get(`/api/student/quizzes/${quizId}`)
            .then((response) => { if (!cancelled) setQuiz(response.data); })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message || "Unable to load quiz.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [quizId]);

    const start = async () => {
        setStarting(true);
        setError("");
        try {
            const response = await api.post(`/api/student/quizzes/${quizId}/attempts`);
            navigate(`/student/quizzes/${quizId}/attempt/${response.data.id}`);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to start quiz.");
            try {
                await loadQuiz();
            } catch (refreshError) {
                setError(`${requestError.response?.data?.message || "Unable to start quiz."} `
                    + (refreshError.response?.data?.message || "Quiz status could not be refreshed."));
            }
        } finally {
            setStarting(false);
        }
    };

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header"><div>
                    <h1>{quiz?.title || "Quiz"}</h1>
                    {quiz && <p>{quiz.courseCode} · {quiz.courseName}</p>}
                </div></div>
                {loading && <div className="loading" role="status">Loading quiz...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {quiz && !loading && (
                    <>
                        <section className="form-card">
                            <p>{quiz.description || "No description provided."}</p>
                            <p>{quiz.instructions || "No additional instructions."}</p>
                            <p>{quiz.totalMarks} marks · {quiz.durationMinutes
                                ? `${quiz.durationMinutes} minutes` : "Untimed"} · Maximum {quiz.maxAttempts} attempts</p>
                            {quiz.startsAt && <p>Opens: {new Date(quiz.startsAt).toLocaleString()}</p>}
                            {quiz.endsAt && <p>Closes: {new Date(quiz.endsAt).toLocaleString()}</p>}
                            <strong className={`quiz-status ${quiz.availability.toLowerCase()}`}>
                                {quiz.availability.replaceAll("_", " ")}
                            </strong>
                            <div className="form-actions">
                                {quiz.activeAttemptId && (
                                    <Link className="primary-button"
                                        to={`/student/quizzes/${quiz.id}/attempt/${quiz.activeAttemptId}`}>
                                        Resume attempt
                                    </Link>
                                )}
                                {!quiz.activeAttemptId && quiz.availability === "AVAILABLE" && (
                                    <button className="primary-button" disabled={starting} onClick={start}>
                                        {starting ? "Starting..." : "Start attempt"}
                                    </button>
                                )}
                                <Link className="secondary-button" to="/student/quizzes">Back to quizzes</Link>
                            </div>
                        </section>
                        {quiz.questions.length > 0 && (
                            <section className="quiz-question-preview">
                                <h2>Questions</h2>
                                {quiz.questions.map((question, index) => (
                                    <article className="form-card" key={question.id}>
                                        <h3>{index + 1}. {question.text}</h3>
                                        <p>{question.marks} marks</p>
                                        <ul>{question.options.map((option) =>
                                            <li key={option.id}>{option.text}</li>)}</ul>
                                    </article>
                                ))}
                            </section>
                        )}
                        <section className="table-card">
                            <h2>Your attempts</h2>
                            {quiz.attempts.length === 0 && <p>No attempts started.</p>}
                            {quiz.attempts.map((attempt) => (
                                <article className="quiz-attempt-card" key={attempt.id}>
                                    <div>
                                        <strong>Attempt {attempt.attemptNumber} · {attempt.status}</strong>
                                        <p>Started {new Date(attempt.startedAt).toLocaleString()}
                                            {attempt.submittedAt && ` · Submitted ${new Date(attempt.submittedAt).toLocaleString()}`}
                                        </p>
                                        {quiz.resultsReleased && attempt.score !== null
                                            && <p>Score: {attempt.score}/{attempt.maxScore}</p>}
                                    </div>
                                    <div className="form-actions">
                                        {attempt.status === "IN_PROGRESS" && (
                                            <Link className="primary-button"
                                                to={`/student/quizzes/${quiz.id}/attempt/${attempt.id}`}>Resume</Link>
                                        )}
                                        {quiz.resultsReleased && attempt.score !== null && (
                                            <Link className="secondary-button"
                                                to={`/student/quizzes/${quiz.id}/results/${attempt.id}`}>View result</Link>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </section>
                    </>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentQuizDetail;
