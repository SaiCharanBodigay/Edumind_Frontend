import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FacultyLayout from "../../components/faculty/FacultyLayout";

const EMPTY_FORM = {
    title: "",
    description: "",
    instructions: "",
    dueAt: "",
    maxMarks: "100"
};

function toLocalDateTime(value) {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

function formatDate(value) {
    return new Date(value).toLocaleString();
}

function FacultyAssignments() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [courseLoading, setCourseLoading] = useState(true);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [gradeForms, setGradeForms] = useState({});

    useEffect(() => {
        const role = localStorage.getItem("edumind_role");
        if (role !== "FACULTY") {
            navigate(role === "ADMIN" ? "/admin/dashboard" : "/faculty/login");
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
                console.error("Faculty assignments courses error:", requestError);
                if (!cancelled) {
                    setError(requestError.response?.data?.message
                        || "Unable to load your assigned courses.");
                }
            })
            .finally(() => {
                if (!cancelled) setCourseLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    useEffect(() => {
        if (!courseId) return undefined;
        let cancelled = false;
        api.get(`/api/faculty/courses/${courseId}/assignments`)
            .then((response) => {
                if (!cancelled) setAssignments(response.data);
            })
            .catch((requestError) => {
                console.error("Faculty assignments list error:", requestError);
                if (!cancelled) {
                    setError(requestError.response?.data?.message
                        || "Unable to load assignments.");
                }
            })
            .finally(() => {
                if (!cancelled) setAssignmentsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const refreshAssignments = async () => {
        if (!courseId) return;
        const response = await api.get(`/api/faculty/courses/${courseId}/assignments`);
        setAssignments(response.data);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        if (new Date(form.dueAt).getTime() <= Date.now()) {
            setError("The due date and time must be in the future.");
            return;
        }
        setSaving(true);
        const request = {
            ...form,
            dueAt: new Date(form.dueAt).toISOString(),
            maxMarks: Number(form.maxMarks)
        };
        try {
            if (editingId) {
                await api.put(`/api/faculty/assignments/${editingId}`, request);
                setMessage("Assignment updated.");
            } else {
                await api.post(
                    `/api/faculty/courses/${courseId}/assignments`,
                    request
                );
                setMessage("Assignment created.");
            }
            setEditingId(null);
            setForm(EMPTY_FORM);
            await refreshAssignments();
        } catch (requestError) {
            console.error("Assignment save error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to save this assignment.");
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (assignment) => {
        setEditingId(assignment.id);
        setForm({
            title: assignment.title,
            description: assignment.description || "",
            instructions: assignment.instructions,
            dueAt: toLocalDateTime(assignment.dueAt),
            maxMarks: String(assignment.maxMarks)
        });
        setSelectedAssignment(null);
        setSubmissions([]);
        setError("");
        setMessage("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleDelete = async (assignment) => {
        if (!window.confirm(`Delete "${assignment.title}"?`)) return;
        setError("");
        try {
            await api.delete(`/api/faculty/assignments/${assignment.id}`);
            setMessage("Assignment deleted.");
            if (selectedAssignment?.id === assignment.id) {
                setSelectedAssignment(null);
                setSubmissions([]);
            }
            await refreshAssignments();
        } catch (requestError) {
            console.error("Assignment delete error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to delete this assignment.");
        }
    };

    const showSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissionsLoading(true);
        setSubmissions([]);
        setError("");
        try {
            const response = await api.get(
                `/api/faculty/assignments/${assignment.id}/submissions`
            );
            setSubmissions(response.data);
            setGradeForms(Object.fromEntries(response.data.map((submission) => [
                submission.id,
                {
                    marks: submission.marks ?? "",
                    feedback: submission.feedback ?? "",
                    releaseGrade: submission.gradeReleased
                }
            ])));
        } catch (requestError) {
            console.error("Assignment submissions error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to load submissions.");
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleGrade = async (submission) => {
        const grade = gradeForms[submission.id];
        setError("");
        try {
            const response = await api.put(
                `/api/faculty/assignments/${selectedAssignment.id}/submissions/${submission.id}/grade`,
                {
                    marks: Number(grade.marks),
                    feedback: grade.feedback,
                    releaseGrade: grade.releaseGrade
                }
            );
            setSubmissions((current) => current.map((item) =>
                item.id === submission.id ? response.data : item
            ));
            setMessage("Grade saved.");
        } catch (requestError) {
            console.error("Submission grading error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to save this grade.");
        }
    };

    const downloadSubmission = async (submission) => {
        try {
            const response = await api.get(
                `/api/faculty/assignments/${selectedAssignment.id}/submissions/${submission.id}/download`,
                { responseType: "blob" }
            );
            const url = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = submission.filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (requestError) {
            console.error("Submission download error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to download this submission.");
        }
    };

    return (
        <FacultyLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Assignments</h1>
                        <p>Create course work and review student submissions.</p>
                    </div>
                </div>

                {courseLoading && <div className="loading" role="status">Loading assigned courses...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {message && <div className="form-message" role="status">{message}</div>}
                {!courseLoading && courses.length === 0 && !error && (
                    <div className="faculty-empty-state">No courses are assigned to you.</div>
                )}
                {!courseLoading && courses.length > 0 && (
                    <>
                        <section className="form-card assignment-form-card">
                            <div className="form-group">
                                <label htmlFor="assignment-course">Course</label>
                                <select
                                    id="assignment-course"
                                    value={courseId}
                                    onChange={(event) => {
                                        setCourseId(event.target.value);
                                        setAssignmentsLoading(true);
                                        setSelectedAssignment(null);
                                        setSubmissions([]);
                                        setEditingId(null);
                                        setForm(EMPTY_FORM);
                                    }}
                                >
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <h2>{editingId ? "Edit Assignment" : "Create Assignment"}</h2>
                            {editingId && (
                                <p className="assignment-edit-notice">
                                    Assignments become locked for editing after the first submission.
                                </p>
                            )}
                            <form onSubmit={handleSave}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="assignment-title">Title</label>
                                        <input
                                            id="assignment-title"
                                            maxLength="180"
                                            required
                                            value={form.title}
                                            onChange={(event) => setForm({
                                                ...form, title: event.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="assignment-due">Due date and time</label>
                                        <input
                                            id="assignment-due"
                                            type="datetime-local"
                                            required
                                            value={form.dueAt}
                                            onChange={(event) => setForm({
                                                ...form, dueAt: event.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="assignment-marks">Maximum marks</label>
                                        <input
                                            id="assignment-marks"
                                            type="number"
                                            min="0.01"
                                            max="1000000"
                                            step="0.01"
                                            required
                                            value={form.maxMarks}
                                            onChange={(event) => setForm({
                                                ...form, maxMarks: event.target.value
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="assignment-description">Description (optional)</label>
                                    <textarea
                                        id="assignment-description"
                                        rows="2"
                                        maxLength="5000"
                                        value={form.description}
                                        onChange={(event) => setForm({
                                            ...form, description: event.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="assignment-instructions">Instructions</label>
                                    <textarea
                                        id="assignment-instructions"
                                        rows="5"
                                        maxLength="10000"
                                        required
                                        value={form.instructions}
                                        onChange={(event) => setForm({
                                            ...form, instructions: event.target.value
                                        })}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button className="primary-button" type="submit" disabled={saving}>
                                        {saving ? "Saving..." : editingId ? "Save changes" : "Create assignment"}
                                    </button>
                                    {editingId && (
                                        <button
                                            className="secondary-button"
                                            type="button"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </section>

                        <div className="faculty-section-heading assignment-list-heading">
                            <h2>Course assignments</h2>
                        </div>
                        {assignmentsLoading && (
                            <div className="loading" role="status">Loading assignments...</div>
                        )}
                        {!assignmentsLoading && assignments.length === 0 && (
                            <div className="faculty-empty-state">
                                No assignments have been created for this course.
                            </div>
                        )}
                        {!assignmentsLoading && assignments.length > 0 && (
                            <div className="assignment-list">
                                {assignments.map((assignment) => (
                                    <article className="assignment-card" key={assignment.id}>
                                        <div className="assignment-card-content">
                                            <h3>{assignment.title}</h3>
                                            <p>{assignment.description || "No description provided."}</p>
                                            <span>
                                                Due {formatDate(assignment.dueAt)} · {assignment.maxMarks} marks
                                                · {assignment.submissionCount} submissions
                                            </span>
                                        </div>
                                        <div className="action-buttons assignment-actions">
                                            <button
                                                className="secondary-button"
                                                type="button"
                                                onClick={() => showSubmissions(assignment)}
                                            >
                                                Review
                                            </button>
                                            <button
                                                className="edit-button"
                                                type="button"
                                                disabled={assignment.submissionCount > 0}
                                                title={assignment.submissionCount > 0
                                                    ? "Locked after the first submission"
                                                    : "Edit assignment"}
                                                onClick={() => startEdit(assignment)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button"
                                                type="button"
                                                disabled={assignment.submissionCount > 0}
                                                title={assignment.submissionCount > 0
                                                    ? "Cannot delete an assignment with submissions"
                                                    : "Delete assignment"}
                                                onClick={() => handleDelete(assignment)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {selectedAssignment && (
                            <section className="assignment-submissions-panel">
                                <div className="faculty-section-heading">
                                    <div>
                                        <h2>Submissions: {selectedAssignment.title}</h2>
                                        <p>Marks are visible to students only after release.</p>
                                    </div>
                                    <button
                                        className="secondary-button"
                                        type="button"
                                        onClick={() => setSelectedAssignment(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                                {submissionsLoading && (
                                    <div className="loading" role="status">Loading submissions...</div>
                                )}
                                {!submissionsLoading && submissions.length === 0 && (
                                    <div className="faculty-empty-state">No submissions received yet.</div>
                                )}
                                {!submissionsLoading && submissions.map((submission) => (
                                    <article className="submission-review-card" key={submission.id}>
                                        <div className="submission-student">
                                            <strong>{submission.studentName}</strong>
                                            <span>{submission.rollNumber} · Submitted {formatDate(submission.submittedAt)}</span>
                                            <button
                                                className="student-course-link"
                                                type="button"
                                                onClick={() => downloadSubmission(submission)}
                                            >
                                                Download {submission.filename}
                                            </button>
                                        </div>
                                        <div className="submission-grade-form">
                                            <label>
                                                Marks
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={selectedAssignment.maxMarks}
                                                    step="0.01"
                                                    value={gradeForms[submission.id]?.marks ?? ""}
                                                    onChange={(event) => setGradeForms({
                                                        ...gradeForms,
                                                        [submission.id]: {
                                                            ...gradeForms[submission.id],
                                                            marks: event.target.value
                                                        }
                                                    })}
                                                />
                                            </label>
                                            <label>
                                                Feedback
                                                <textarea
                                                    rows="2"
                                                    maxLength="5000"
                                                    value={gradeForms[submission.id]?.feedback ?? ""}
                                                    onChange={(event) => setGradeForms({
                                                        ...gradeForms,
                                                        [submission.id]: {
                                                            ...gradeForms[submission.id],
                                                            feedback: event.target.value
                                                        }
                                                    })}
                                                />
                                            </label>
                                            <label className="release-grade-control">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(gradeForms[submission.id]?.releaseGrade)}
                                                    onChange={(event) => setGradeForms({
                                                        ...gradeForms,
                                                        [submission.id]: {
                                                            ...gradeForms[submission.id],
                                                            releaseGrade: event.target.checked
                                                        }
                                                    })}
                                                />
                                                Release grade and feedback
                                            </label>
                                            <button
                                                className="primary-button"
                                                type="button"
                                                onClick={() => handleGrade(submission)}
                                                disabled={!gradeForms[submission.id]?.marks}
                                            >
                                                Save grade
                                            </button>
                                            <span className="submission-grade-status">
                                                {submission.gradeReleased ? "Grade released" : "Not released"}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </section>
                        )}
                    </>
                )}
            </div>
        </FacultyLayout>
    );
}

export default FacultyAssignments;
