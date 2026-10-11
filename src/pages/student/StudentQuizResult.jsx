import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentQuizResult() {
    const { quizId, attemptId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get(`/api/student/quizzes/${quizId}/attempts/${attemptId}/results`)
            .then((response) => { if (!cancelled) setResult(response.data); })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message || "Unable to load released result.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [attemptId, quizId]);

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header"><div><h1>Quiz result</h1>
                    {result && <p>Score: {result.score}/{result.maxScore} · {result.status}</p>}
                </div></div>
                {loading && <div className="loading" role="status">Loading result...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {result && result.answers.map((answer, index) => (
                    <article className="form-card quiz-result-card" key={answer.questionId}>
                        <h2>{index + 1}. {answer.questionText}</h2>
                        <p>{answer.correct ? "Correct" : "Incorrect"} · {answer.marks} marks</p>
                        <p>Your answer: {answer.selectedOptionText || "No answer selected"}</p>
                        <p>Correct answer: {answer.correctOptionText}</p>
                    </article>
                ))}
                <Link className="secondary-button" to={`/student/quizzes/${quizId}`}>Back to quiz</Link>
            </div>
        </StudentLayout>
    );
}

export default StudentQuizResult;
