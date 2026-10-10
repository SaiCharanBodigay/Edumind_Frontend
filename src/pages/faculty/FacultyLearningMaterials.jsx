import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FacultyLayout from "../../components/faculty/FacultyLayout";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain"
};

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileValidationError(file) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !Object.hasOwn(ACCEPTED_TYPES, extension)) {
        return "Choose a PDF, DOCX, PPTX, or TXT file.";
    }
    if (file.size === 0) {
        return "The selected file is empty.";
    }
    if (file.size > MAX_FILE_SIZE) {
        return "Files must be 20 MB or smaller.";
    }
    if (file.type && file.type !== ACCEPTED_TYPES[extension]
        && file.type !== "application/octet-stream") {
        return "The selected file's content type does not match a supported format.";
    }
    return "";
}

function FacultyLearningMaterials() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [courseLoading, setCourseLoading] = useState(true);
    const [courseError, setCourseError] = useState("");
    const [materials, setMaterials] = useState([]);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

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
                    setSelectedCourseId(response.data[0] ? String(response.data[0].id) : "");
                    if (response.data.length === 0) setMaterialsLoading(false);
                }
            })
            .catch((requestError) => {
                console.error("Faculty learning materials courses error:", requestError);
                if (!cancelled) {
                    setCourseError(
                        requestError.response?.data?.message ||
                        "Unable to load your assigned courses."
                    );
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
        if (!selectedCourseId) {
            return undefined;
        }

        let cancelled = false;
        api.get(`/api/faculty/courses/${selectedCourseId}/materials`)
            .then((response) => {
                if (!cancelled) setMaterials(response.data);
            })
            .catch((requestError) => {
                console.error("Learning materials list error:", requestError);
                if (!cancelled) {
                    setMaterialsError(
                        requestError.response?.data?.message ||
                        "Unable to load materials for this course."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setMaterialsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedCourseId]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setUploadError(file ? getFileValidationError(file) : "");
        setMessage("");
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedCourseId || !selectedFile) {
            setUploadError("Select a course and a file before uploading.");
            return;
        }
        const validationError = getFileValidationError(selectedFile);
        if (validationError) {
            setUploadError(validationError);
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        setUploading(true);
        setMessage("");
        setUploadError("");
        try {
            await api.post(
                `/api/faculty/courses/${selectedCourseId}/materials`,
                formData
            );
            setSelectedFile(null);
            event.target.reset();
            setMessage("Learning material uploaded successfully.");
        } catch (requestError) {
            console.error("Learning material upload error:", requestError);
            setUploadError(
                requestError.response?.data?.message ||
                "Unable to upload this file. Please try again."
            );
            return;
        } finally {
            setUploading(false);
        }

        try {
            const response = await api.get(
                `/api/faculty/courses/${selectedCourseId}/materials`
            );
            setMaterials(response.data);
            setMaterialsError("");
        } catch (requestError) {
            console.error("Learning materials refresh error:", requestError);
            setMaterialsError(
                requestError.response?.data?.message ||
                "The file was uploaded, but the materials list could not be refreshed."
            );
        }
    };

    const handleDownload = async (material) => {
        try {
            const response = await api.get(
                `/api/faculty/materials/${material.id}/download`,
                { responseType: "blob" }
            );
            const downloadUrl = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = material.filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        } catch (requestError) {
            console.error("Learning material download error:", requestError);
            setMaterialsError(
                requestError.response?.data?.message ||
                "Unable to download this material."
            );
        }
    };

    const handleDelete = async (material) => {
        if (!window.confirm(`Delete "${material.filename}"? This cannot be undone.`)) {
            return;
        }
        setDeletingId(material.id);
        setMaterialsError("");
        try {
            await api.delete(`/api/faculty/materials/${material.id}`);
            setMaterials((current) => current.filter((item) => item.id !== material.id));
            setMessage("Learning material deleted.");
        } catch (requestError) {
            console.error("Learning material delete error:", requestError);
            setMaterialsError(
                requestError.response?.data?.message ||
                "Unable to delete this material."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <FacultyLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Learning Materials</h1>
                        <p>Upload and manage resources for your assigned courses.</p>
                    </div>
                </div>

                {courseLoading && (
                    <div className="loading" role="status">Loading your courses...</div>
                )}
                {courseError && <div className="error-message" role="alert">{courseError}</div>}
                {!courseLoading && !courseError && courses.length === 0 && (
                    <div className="faculty-empty-state">
                        You do not have any courses assigned yet.
                    </div>
                )}

                {!courseLoading && !courseError && courses.length > 0 && (
                    <>
                        <section className="form-card materials-upload-card">
                            <div className="form-group">
                                <label htmlFor="materials-course">Course</label>
                                <select
                                    id="materials-course"
                                    value={selectedCourseId}
                                    onChange={(event) => {
                                        setSelectedCourseId(event.target.value);
                                        setMaterials([]);
                                        setMaterialsLoading(true);
                                        setMaterialsError("");
                                        setSelectedFile(null);
                                        setMessage("");
                                        setUploadError("");
                                    }}
                                >
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.name} (Semester {course.semesterNumber})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <form onSubmit={handleUpload}>
                                <div className="form-group">
                                    <label htmlFor="materials-file">File</label>
                                    <input
                                        id="materials-file"
                                        type="file"
                                        accept=".pdf,.docx,.pptx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                    <p className="materials-help">
                                        PDF, DOCX, PPTX, or TXT. Maximum file size: 20 MB.
                                    </p>
                                </div>
                                {selectedFile && (
                                    <p className="selected-file">
                                        {selectedFile.name} · {formatSize(selectedFile.size)}
                                    </p>
                                )}
                                {uploadError && (
                                    <div className="error-message" role="alert">{uploadError}</div>
                                )}
                                {message && (
                                    <div className="form-message" role="status">{message}</div>
                                )}
                                <button
                                    className="primary-button"
                                    type="submit"
                                    disabled={uploading || !selectedFile || Boolean(uploadError)}
                                >
                                    {uploading ? "Uploading..." : "Upload material"}
                                </button>
                            </form>
                        </section>

                        <div className="faculty-section-heading materials-heading">
                            <h2>Course materials</h2>
                            <span className="faculty-course-count">
                                {materials.length} {materials.length === 1 ? "file" : "files"}
                            </span>
                        </div>
                        {materialsLoading && (
                            <div className="loading" role="status">Loading course materials...</div>
                        )}
                        {materialsError && (
                            <div className="error-message" role="alert">{materialsError}</div>
                        )}
                        {!materialsLoading && !materialsError && materials.length === 0 && (
                            <div className="faculty-empty-state">
                                No learning materials have been uploaded for this course.
                            </div>
                        )}
                        {!materialsLoading && materials.length > 0 && (
                            <div className="materials-list">
                                {materials.map((material) => (
                                    <article className="materials-item" key={material.id}>
                                        <div className="materials-file-details">
                                            <h3>{material.filename}</h3>
                                            <p>
                                                {material.contentType} · {formatSize(material.size)}
                                            </p>
                                            <span>
                                                Uploaded {new Date(material.uploadedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="action-buttons materials-actions">
                                            <button
                                                className="secondary-button"
                                                type="button"
                                                onClick={() => handleDownload(material)}
                                            >
                                                Download
                                            </button>
                                            <button
                                                className="delete-button"
                                                type="button"
                                                disabled={deletingId === material.id}
                                                onClick={() => handleDelete(material)}
                                            >
                                                {deletingId === material.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </FacultyLayout>
    );
}

export default FacultyLearningMaterials;
