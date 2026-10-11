import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentQuizAttempt() {
    const { quizId, attemptId } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [now, setNow] = useState(0);

    const loadAttempt = useCallback(async () => {
        const response = await api.get(`/api/student/quiz-attempts/${attemptId}`);
        setAttempt(response.data);
    }, [attemptId]);

    useEffect(() => {
        let cancelled = false;
        api.get(`/api/student/quiz-attempts/${attemptId}`)
            .then((response) => { if (!cancelled) setAttempt(response.data); })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message
                    || "Unable to load this attempt.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [attemptId]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const submit = useCallback(async (automatic = false) => {
        if (submitting || !attempt || attempt.status !== "IN_PROGRESS") return;
        if (!automatic && !window.confirm("Submit your answers? You cannot change them afterward.")) return;
        setSubmitting(true);
        setError("");
        try {
            const response = await api.post(`/api/student/quiz-attempts/${attemptId}/submit`);
            setAttempt(response.data);
        } catch (requestError) {
            try {
                await loadAttempt();
            } catch (refreshError) {
                setError(`${requestError.response?.data?.message || "Unable to submit the attempt."} `
                    + (refreshError.response?.data?.message || "Attempt status could not be refreshed."));
            }
        } finally {
            setSubmitting(false);
        }
    }, [attempt, attemptId, loadAttempt, submitting]);

    useEffect(() => {
        if (attempt?.status !== "IN_PROGRESS" || !attempt.deadline) return undefined;
        let submittedOnTimeout = false;
        const timer = window.setInterval(() => {
            const timestamp = Date.now();
            setNow(timestamp);
            if (!submittedOnTimeout && timestamp >= new Date(attempt.deadline).getTime()) {
                submittedOnTimeout = true;
                api.post(`/api/student/quiz-attempts/${attemptId}/submit`)
                    .then((response) => setAttempt(response.data))
                    .catch((requestError) => setError(requestError.response?.data?.message
                        || "The timed-out attempt status could not be saved."));
            }
        }, 1000);
        return () => window.clearInterval(timer);
    }, [attempt?.deadline, attempt?.status, attemptId]);

    const chooseOption = async (question, optionId) => {
        if (saving || attempt.status !== "IN_PROGRESS") return;
        setSaving(true);
        setError("");
        try {
            const response = await api.put(
                `/api/student/quiz-attempts/${attemptId}/answers/${question.questionId}`,
                { optionId }
            );
            setAttempt(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to save your answer.");
        } finally {
            setSaving(false);
        }
    };

    const activeQuestion = attempt?.questions[currentIndex];
    const secondsLeft = attempt?.deadline
        ? Math.max(0, Math.floor((new Date(attempt.deadline).getTime() - now) / 1000))
        : null;

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header">
                    <div><h1>{attempt?.quizTitle || "Quiz attempt"}</h1>
                        {attempt && <p>Attempt {attempt.attemptNumber} · {attempt.status.replaceAll("_", " ")}</p>}
                    </div>
                    {secondsLeft !== null && attempt?.status === "IN_PROGRESS" && (
                        <strong className="quiz-timer" aria-live="polite">
                            Time left: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                        </strong>
                    )}
                </div>
                {loading && <div className="loading" role="status">Loading attempt...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {attempt && !loading && (
                    <>
                        {attempt.status === "IN_PROGRESS" && activeQuestion && (
                            <section className="form-card quiz-taking-card">
                                <p>Question {currentIndex + 1} of {attempt.questions.length} · {activeQuestion.marks} marks</p>
                                <h2>{activeQuestion.questionText}</h2>
                                <div className="quiz-taking-options">
                                    {activeQuestion.options.map((option) => (
                                        <label className="quiz-taking-option" key={option.id}>
                                            <input type="radio" name={`question-${activeQuestion.questionId}`}
                                                checked={activeQuestion.selectedOptionId === option.id}
                                                disabled={saving}
                                                onChange={() => chooseOption(activeQuestion, option.id)} />
                                            <span>{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                                {saving && <p role="status">Saving answer...</p>}
                                <div className="form-actions">
                                    <button className="secondary-button" disabled={currentIndex === 0 || saving}
                                        onClick={() => setCurrentIndex((index) => index - 1)}>Previous</button>
                                    <button className="secondary-button"
                                        disabled={currentIndex >= attempt.questions.length - 1 || saving}
                                        onClick={() => setCurrentIndex((index) => index + 1)}>Next</button>
                                    <span>{attempt.questions.filter((question) => question.selectedOptionId).length}
                                        /{attempt.questions.length} answered</span>
                                    <button className="primary-button" disabled={submitting || saving}
                                        onClick={() => submit(false)}>
                                        {submitting ? "Submitting..." : "Submit quiz"}
                                    </button>
                                </div>
                                <nav className="quiz-question-nav" aria-label="Question navigation">
                                    {attempt.questions.map((question, index) => (
                                        <button type="button" key={question.questionId}
                                            className={index === currentIndex ? "active" : ""}
                                            aria-label={`Go to question ${index + 1}`}
                                            onClick={() => setCurrentIndex(index)}>
                                            {index + 1}{question.selectedOptionId ? " ✓" : ""}
                                        </button>
                                    ))}
                                </nav>
                            </section>
                        )}
                        {attempt.status !== "IN_PROGRESS" && (
                            <section className="form-card">
                                <h2>Attempt {attempt.status.replaceAll("_", " ").toLowerCase()}</h2>
                                <p>Your answers have been saved. {attempt.resultsReleased && attempt.score !== null
                                    ? `Score: ${attempt.score}/${attempt.maxScore}.`
                                    : "Results will appear here after your instructor releases them."}</p>
                                <div className="form-actions">
                                    {attempt.resultsReleased && <Link className="primary-button"
                                        to={`/student/quizzes/${quizId}/results/${attemptId}`}>View result</Link>}
                                    <Link className="secondary-button" to={`/student/quizzes/${quizId}`}>Quiz details</Link>
                                    <Link className="secondary-button" to="/student/quizzes">All quizzes</Link>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentQuizAttempt;
