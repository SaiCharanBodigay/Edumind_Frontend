import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StudentCourseMaterials() {
    const { courseId } = useParams();
    return <StudentCourseMaterialsContent key={courseId} courseId={courseId} />;
}

function StudentCourseMaterialsContent({ courseId }) {
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            api.get("/api/student/me/courses"),
            api.get(`/api/student/courses/${courseId}/materials`)
        ])
            .then(([coursesResponse, materialsResponse]) => {
                if (!cancelled) {
                    setCourse(coursesResponse.data.find(
                        (item) => String(item.id) === String(courseId)
                    ) || null);
                    setMaterials(materialsResponse.data);
                }
            })
            .catch((requestError) => {
                console.error("Student course materials error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load materials for this course."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [courseId]);

    const handleDownload = async (material) => {
        try {
            const response = await api.get(
                `/api/student/materials/${material.id}/download`,
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
            console.error("Student material download error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to download this material."
            );
        }
    };

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header student-detail-header">
                    <div>
                        <h1>{course?.name || "Course Materials"}</h1>
                        <p>{course ? `${course.code} · Semester ${course.semesterNumber}` : "Materials available to you"}</p>
                    </div>
                    <Link className="secondary-button student-back-link" to="/student/courses">
                        Back to courses
                    </Link>
                </div>

                {loading && <div className="loading" role="status">Loading course materials...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {!loading && !error && materials.length === 0 && (
                    <div className="faculty-empty-state">
                        No learning materials are available for this course yet.
                    </div>
                )}
                {!loading && !error && materials.length > 0 && (
                    <div className="materials-list">
                        {materials.map((material) => (
                            <article className="materials-item" key={material.id}>
                                <div className="materials-file-details">
                                    <h3>{material.filename}</h3>
                                    <p>{material.contentType} · {formatSize(material.size)}</p>
                                    <span>
                                        Uploaded {new Date(material.uploadedAt).toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    className="primary-button"
                                    type="button"
                                    onClick={() => handleDownload(material)}
                                >
                                    Download
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentCourseMaterials;
