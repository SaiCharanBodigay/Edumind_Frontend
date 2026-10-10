import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

const ACCEPTED_TYPES = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain"
};
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatDate(value) {
    return new Date(value).toLocaleString();
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StudentAssignmentDetail() {
    const { assignmentId } = useParams();
    return <StudentAssignmentDetailContent key={assignmentId} assignmentId={assignmentId} />;
}

function StudentAssignmentDetailContent({ assignmentId }) {
    const [assignment, setAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get(`/api/student/assignments/${assignmentId}`)
            .then((response) => {
                if (!cancelled) setAssignment(response.data);
            })
            .catch((requestError) => {
                console.error("Student assignment detail error:", requestError);
                if (!cancelled) {
                    setError(requestError.response?.data?.message
                        || "Unable to load this assignment.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [assignmentId]);

    const onFileChange = (event) => {
        const selected = event.target.files?.[0] || null;
        setFile(selected);
        setMessage("");
        if (!selected) {
            setFileError("");
            return;
        }
        const extension = selected.name.split(".").pop()?.toLowerCase();
        if (!extension || !Object.hasOwn(ACCEPTED_TYPES, extension)) {
            setFileError("Choose a PDF, DOCX, PPTX, or TXT file.");
        } else if (selected.size === 0) {
            setFileError("The selected file is empty.");
        } else if (selected.size > MAX_FILE_SIZE) {
            setFileError("Submissions must be 10 MB or smaller.");
        } else if (selected.type && selected.type !== ACCEPTED_TYPES[extension]
            && selected.type !== "application/octet-stream") {
            setFileError("The selected file's content type does not match its format.");
        } else {
            setFileError("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file || fileError) return;
        setSubmitting(true);
        setError("");
        setMessage("");
        const data = new FormData();
        data.append("file", file);
        try {
            const response = await api.post(
                `/api/student/assignments/${assignmentId}/submissions`,
                data
            );
            setAssignment(response.data);
            setFile(null);
            event.target.reset();
            setMessage("Your assignment was submitted successfully.");
        } catch (requestError) {
            console.error("Assignment submission error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to submit this assignment.");
        } finally {
            setSubmitting(false);
        }
    };

    const downloadMySubmission = async () => {
        try {
            const response = await api.get(
                `/api/student/assignments/${assignmentId}/submissions/${assignment.submissionId}/download`,
                { responseType: "blob" }
            );
            const url = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = assignment.submittedFilename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (requestError) {
            console.error("Own submission download error:", requestError);
            setError(requestError.response?.data?.message
                || "Unable to download your submission.");
        }
    };

    const submitted = assignment?.submissionId != null;
    const deadlinePassed = assignment?.submissionStatus === "MISSED";

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header student-detail-header">
                    <div>
                        <h1>{assignment?.title || "Assignment"}</h1>
                        {assignment && (
                            <p>{assignment.courseCode} · {assignment.courseName}</p>
                        )}
                    </div>
                    <Link className="secondary-button student-back-link" to="/student/assignments">
                        Back to assignments
                    </Link>
                </div>
                {loading && <div className="loading" role="status">Loading assignment...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {message && <div className="form-message" role="status">{message}</div>}
                {!loading && !error && assignment && (
                    <>
                        <section className="assignment-detail-card">
                            <div className="assignment-detail-meta">
                                <span>Due {formatDate(assignment.dueAt)}</span>
                                <span>Maximum marks: {assignment.maxMarks}</span>
                                <span>Status: {assignment.submissionStatus.replaceAll("_", " ")}</span>
                            </div>
                            {assignment.description && (
                                <div>
                                    <h2>Description</h2>
                                    <p className="assignment-prose">{assignment.description}</p>
                                </div>
                            )}
                            <div>
                                <h2>Instructions</h2>
                                <p className="assignment-prose">{assignment.instructions}</p>
                            </div>
                        </section>

                        {submitted && (
                            <section className="form-card">
                                <h2>Submission received</h2>
                                <p>
                                    {assignment.submittedFilename} · submitted {formatDate(assignment.submittedAt)}
                                </p>
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={downloadMySubmission}
                                >
                                    Download my submission
                                </button>
                                {assignment.submissionStatus === "GRADED" ? (
                                    <div className="released-grade">
                                        <strong>
                                            Grade: {assignment.releasedMarks} / {assignment.maxMarks}
                                        </strong>
                                        {assignment.releasedFeedback && (
                                            <p className="assignment-prose">
                                                {assignment.releasedFeedback}
                                            </p>
                                        )}
                                        <span>Released {formatDate(assignment.releasedAt)}</span>
                                    </div>
                                ) : (
                                    <p className="assignment-edit-notice">
                                        Your submission is recorded. Grade and feedback will appear here once released.
                                    </p>
                                )}
                            </section>
                        )}

                        {!submitted && !deadlinePassed && (
                            <section className="form-card">
                                <h2>Submit your work</h2>
                                <p className="materials-help">
                                    PDF, DOCX, PPTX, or TXT · maximum 10 MB · one submission only.
                                </p>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="submission-file">Submission file</label>
                                        <input
                                            id="submission-file"
                                            type="file"
                                            accept=".pdf,.docx,.pptx,.txt"
                                            onChange={onFileChange}
                                            disabled={submitting}
                                        />
                                    </div>
                                    {file && (
                                        <p className="selected-file">
                                            {file.name} · {formatSize(file.size)}
                                        </p>
                                    )}
                                    {fileError && (
                                        <div className="error-message" role="alert">{fileError}</div>
                                    )}
                                    <button
                                        className="primary-button"
                                        type="submit"
                                        disabled={submitting || !file || Boolean(fileError)}
                                    >
                                        {submitting ? "Submitting..." : "Submit assignment"}
                                    </button>
                                </form>
                            </section>
                        )}
                        {!submitted && deadlinePassed && (
                            <div className="error-message" role="status">
                                The deadline passed. Late submissions are not accepted.
                            </div>
                        )}
                    </>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentAssignmentDetail;
