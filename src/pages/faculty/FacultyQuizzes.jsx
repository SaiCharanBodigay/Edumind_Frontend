import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FacultyLayout from "../../components/faculty/FacultyLayout";

const emptyQuestion = () => ({
    text: "",
    marks: "1",
    options: [
        { text: "", correct: true },
        { text: "", correct: false }
    ]
});

const emptyForm = () => ({
    title: "",
    description: "",
    instructions: "",
    startsAt: "",
    endsAt: "",
    durationMinutes: "",
    maxAttempts: "1",
    questions: [emptyQuestion()]
});

function toLocalDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function FacultyQuizzes() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [form, setForm] = useState(emptyForm());
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (localStorage.getItem("edumind_role") !== "FACULTY") {
            navigate(localStorage.getItem("edumind_role") === "ADMIN"
                ? "/admin/dashboard" : "/faculty/login");
            return;
        }
        let cancelled = false;
        api.get("/api/faculty/me/courses")
            .then((response) => {
                if (!cancelled) {
                    setCourses(response.data);
                    setCourseId(response.data[0] ? String(response.data[0].id) : "");
                }
            })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message
                    || "Unable to load your assigned courses.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [navigate]);

    const refresh = async () => {
        if (!courseId) return;
        const response = await api.get(`/api/faculty/courses/${courseId}/quizzes`);
        setQuizzes(response.data);
        if (selectedQuiz) {
            const updated = response.data.find((quiz) => quiz.id === selectedQuiz.id);
            if (updated) setSelectedQuiz(updated);
        }
    };

    useEffect(() => {
        if (!courseId) return undefined;
        let cancelled = false;
        api.get(`/api/faculty/courses/${courseId}/quizzes`)
            .then((response) => {
                if (!cancelled) {
                    setQuizzes(response.data);
                    setSelectedQuiz(null);
                    setAttempts([]);
                }
            })
            .catch((requestError) => {
                if (!cancelled) setError(requestError.response?.data?.message
                    || "Unable to load quizzes.");
            });
        return () => { cancelled = true; };
    }, [courseId]);

    const beginCreate = () => {
        setEditingId(null);
        setForm(emptyForm());
        setEditorOpen(true);
        setSelectedQuiz(null);
        setAttempts([]);
        setError("");
        setMessage("");
    };

    const beginEdit = (quiz) => {
        setEditingId(quiz.id);
        setSelectedQuiz(quiz);
        setForm({
            title: quiz.title,
            description: quiz.description || "",
            instructions: quiz.instructions || "",
            startsAt: toLocalDateTime(quiz.startsAt),
            endsAt: toLocalDateTime(quiz.endsAt),
            durationMinutes: quiz.durationMinutes ? String(quiz.durationMinutes) : "",
            maxAttempts: String(quiz.maxAttempts),
            questions: quiz.questions.map((question) => ({
                text: question.text,
                marks: String(question.marks),
                options: question.options.map((option) => ({
                    text: option.text,
                    correct: option.correct
                }))
            }))
        });
        setEditorOpen(true);
        setAttempts([]);
        setError("");
        setMessage("");
    };

    const showAttempts = async (quiz) => {
        setSelectedQuiz(quiz);
        setEditorOpen(false);
        setError("");
        try {
            const response = await api.get(`/api/faculty/quizzes/${quiz.id}/attempts`);
            setAttempts(response.data);
            await refresh();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load quiz attempts.");
        }
    };

    const updateQuestion = (index, key, value) => {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, questionIndex) =>
                questionIndex === index ? { ...question, [key]: value } : question)
        }));
    };

    const updateOption = (questionIndex, optionIndex, key, value) => {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) => {
                if (index !== questionIndex) return question;
                const options = question.options.map((option, currentOptionIndex) => ({
                    ...option,
                    ...(currentOptionIndex === optionIndex ? { [key]: value } : {}),
                    ...(key === "correct" && value && currentOptionIndex !== optionIndex
                        ? { correct: false } : {})
                }));
                return { ...question, options };
            })
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        const payload = {
            ...form,
            startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
            endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
            durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
            maxAttempts: Number(form.maxAttempts),
            questions: form.questions.map((question) => ({
                ...question,
                marks: Number(question.marks)
            }))
        };
        setSaving(true);
        try {
            const response = editingId
                ? await api.put(`/api/faculty/quizzes/${editingId}`, payload)
                : await api.post(`/api/faculty/courses/${courseId}/quizzes`, payload);
            setSelectedQuiz(response.data);
            setEditorOpen(false);
            setMessage(editingId ? "Quiz draft updated." : "Quiz draft created.");
            await refresh();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to save quiz.");
        } finally {
            setSaving(false);
        }
    };

    const quizAction = async (quiz, action, successMessage) => {
        setError("");
        setMessage("");
        try {
            const response = await api.post(`/api/faculty/quizzes/${quiz.id}/${action}`);
            setSelectedQuiz(response.data);
            setMessage(successMessage);
            await refresh();
            if (action === "release-results") await showAttempts(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to update quiz.");
        }
    };

    const deleteQuiz = async (quiz) => {
        if (!window.confirm(`Delete "${quiz.title}"?`)) return;
        setError("");
        try {
            await api.delete(`/api/faculty/quizzes/${quiz.id}`);
            setSelectedQuiz(null);
            setAttempts([]);
            setMessage("Quiz deleted.");
            await refresh();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to delete quiz.");
        }
    };

    const addOption = (questionIndex) => {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) => index === questionIndex
                ? { ...question, options: [...question.options, { text: "", correct: false }] }
                : question)
        }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        setForm((current) => ({
            ...current,
            questions: current.questions.map((question, index) => index === questionIndex
                ? { ...question, options: question.options.filter((_, i) => i !== optionIndex) }
                : question)
        }));
    };

    return (
        <FacultyLayout>
            <div className="page-container">
                <div className="page-header">
                    <div><h1>Quizzes</h1><p>Create course assessments and review attempts.</p></div>
                    {!loading && courses.length > 0 && (
                        <button className="primary-button" onClick={beginCreate}>+ Create Quiz</button>
                    )}
                </div>
                {loading && <div className="loading" role="status">Loading assigned courses...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {message && <div className="form-message" role="status">{message}</div>}
                {!loading && courses.length === 0 && (
                    <div className="faculty-empty-state">No courses are assigned to you.</div>
                )}
                {!loading && courses.length > 0 && (
                    <>
                        <section className="form-card">
                            <div className="form-group">
                                <label htmlFor="quiz-course">Assigned course</label>
                                <select id="quiz-course" value={courseId}
                                    onChange={(event) => {
                                        setCourseId(event.target.value);
                                        setEditorOpen(false);
                                        setSelectedQuiz(null);
                                        setQuizzes([]);
                                        setAttempts([]);
                                    }}>
                                    {courses.map((course) => <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>)}
                                </select>
                            </div>
                        </section>

                        {editorOpen && (
                            <section className="form-card quiz-editor">
                                <h2>{editingId ? "Edit Quiz Draft" : "Create Quiz Draft"}</h2>
                                <p>Once a student starts an attempt, quiz content and scoring are locked.</p>
                                <form onSubmit={handleSave}>
                                    <div className="form-grid">
                                        <label className="form-group">Title
                                            <input required maxLength="180" value={form.title}
                                                onChange={(event) => setForm({ ...form, title: event.target.value })} />
                                        </label>
                                        <label className="form-group">Description
                                            <input maxLength="5000" value={form.description}
                                                onChange={(event) => setForm({ ...form, description: event.target.value })} />
                                        </label>
                                        <label className="form-group">Instructions
                                            <textarea maxLength="10000" value={form.instructions}
                                                onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
                                        </label>
                                        <label className="form-group">Available from
                                            <input type="datetime-local" value={form.startsAt}
                                                onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
                                        </label>
                                        <label className="form-group">Available until
                                            <input type="datetime-local" value={form.endsAt}
                                                onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
                                        </label>
                                        <label className="form-group">Duration in minutes (blank = untimed)
                                            <input type="number" min="1" max="600" value={form.durationMinutes}
                                                onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} />
                                        </label>
                                        <label className="form-group">Maximum attempts
                                            <input type="number" min="1" max="20" required value={form.maxAttempts}
                                                onChange={(event) => setForm({ ...form, maxAttempts: event.target.value })} />
                                        </label>
                                    </div>
                                    <div className="quiz-question-builder">
                                        {form.questions.map((question, questionIndex) => (
                                            <fieldset className="quiz-question-edit" key={questionIndex}>
                                                <legend>Question {questionIndex + 1}</legend>
                                                <div className="form-grid">
                                                    <label className="form-group">Question
                                                        <textarea required maxLength="4000" value={question.text}
                                                            onChange={(event) => updateQuestion(questionIndex, "text", event.target.value)} />
                                                    </label>
                                                    <label className="form-group">Marks
                                                        <input required type="number" min="0.01" step="0.01"
                                                            value={question.marks}
                                                            onChange={(event) => updateQuestion(questionIndex, "marks", event.target.value)} />
                                                    </label>
                                                </div>
                                                <div className="quiz-options-builder">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div className="quiz-option-edit" key={optionIndex}>
                                                            <input aria-label={`Question ${questionIndex + 1} option ${optionIndex + 1}`}
                                                                required maxLength="1000" value={option.text}
                                                                onChange={(event) => updateOption(questionIndex, optionIndex, "text", event.target.value)} />
                                                            <label>
                                                                <input type="radio" name={`correct-${questionIndex}`}
                                                                    checked={option.correct}
                                                                    onChange={() => updateOption(questionIndex, optionIndex, "correct", true)} />
                                                                Correct answer
                                                            </label>
                                                            <button type="button" className="delete-button"
                                                                disabled={question.options.length <= 2}
                                                                onClick={() => removeOption(questionIndex, optionIndex)}>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="form-actions">
                                                    <button type="button" className="secondary-button"
                                                        disabled={question.options.length >= 6}
                                                        onClick={() => addOption(questionIndex)}>Add option</button>
                                                    <button type="button" className="delete-button"
                                                        disabled={form.questions.length <= 1}
                                                        onClick={() => setForm({ ...form, questions: form.questions.filter((_, i) => i !== questionIndex) })}>
                                                        Remove question
                                                    </button>
                                                </div>
                                            </fieldset>
                                        ))}
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="secondary-button"
                                            disabled={form.questions.length >= 100}
                                            onClick={() => setForm({ ...form, questions: [...form.questions, emptyQuestion()] })}>
                                            Add question
                                        </button>
                                        <button className="primary-button" disabled={saving}>
                                            {saving ? "Saving..." : "Save draft"}
                                        </button>
                                        <button type="button" className="secondary-button"
                                            onClick={() => setEditorOpen(false)}>Cancel</button>
                                    </div>
                                </form>
                            </section>
                        )}

                        <section className="quiz-management-grid">
                            <div className="table-card">
                                <h2>Course quizzes</h2>
                                {quizzes.length === 0
                                    ? <p className="faculty-empty-state">No quizzes created for this course.</p>
                                    : quizzes.map((quiz) => (
                                        <article className="quiz-management-card" key={quiz.id}>
                                            <div>
                                                <span className={`quiz-status ${quiz.status.toLowerCase()}`}>{quiz.status}</span>
                                                <h3>{quiz.title}</h3>
                                                <p>{quiz.questionCount} questions · {quiz.totalMarks} marks · {quiz.attemptCount} attempts</p>
                                            </div>
                                            <div className="form-actions">
                                                <button className="secondary-button" onClick={() => showAttempts(quiz)}>Attempts</button>
                                                {quiz.attemptCount === 0 && (
                                                    <button className="secondary-button" onClick={() => beginEdit(quiz)}>Edit</button>
                                                )}
                                                {quiz.status === "DRAFT"
                                                    ? <button className="primary-button" onClick={() => quizAction(quiz, "publish", "Quiz published.")}>Publish</button>
                                                    : <button className="secondary-button" onClick={() => quizAction(quiz, "unpublish", "Quiz unpublished.")}>Unpublish</button>}
                                                {!quiz.resultsReleased && quiz.canReleaseResults && (
                                                    <button className="secondary-button" onClick={() => {
                                                        if (window.confirm("Release scores and correct answers to students? This cannot be undone.")) {
                                                            quizAction(quiz, "release-results", "Results released to students.");
                                                        }
                                                    }}>Release results</button>
                                                )}
                                                {quiz.attemptCount === 0 && (
                                                    <button className="delete-button" onClick={() => deleteQuiz(quiz)}>Delete</button>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                            </div>
                            {selectedQuiz && !editorOpen && (
                                <div className="table-card quiz-attempts-panel">
                                    <h2>Attempts · {selectedQuiz.title}</h2>
                                    {attempts.length === 0 && <p>No student attempts yet.</p>}
                                    {attempts.map((attempt) => (
                                        <details className="quiz-attempt-card" key={attempt.id}>
                                            <summary>
                                                {attempt.studentName} ({attempt.rollNumber}) · Attempt {attempt.attemptNumber}
                                                · {attempt.status}
                                                {attempt.score !== null && ` · ${attempt.score}/${attempt.maxScore}`}
                                            </summary>
                                            <p>Started {new Date(attempt.startedAt).toLocaleString()}
                                                {attempt.submittedAt && ` · Submitted ${new Date(attempt.submittedAt).toLocaleString()}`}</p>
                                            {attempt.questions.map((question) => (
                                                <div className="quiz-answer-review" key={question.questionId}>
                                                    <strong>{question.questionText} ({question.marks} marks)</strong>
                                                    <p>{question.selectedOptionId
                                                        ? question.options.find((option) => option.id === question.selectedOptionId)?.text
                                                        : "No answer selected"}</p>
                                                    <p>Correct answer: {question.options.find((option) =>
                                                        option.id === question.correctOptionId)?.text}</p>
                                                </div>
                                            ))}
                                        </details>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </FacultyLayout>
    );
}

export default FacultyQuizzes;
