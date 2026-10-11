import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

const importOptions = [
    {
        id: "students-csv",
        title: "Students - CSV",
        endpoint: "/api/admin/students/import",
        accept: ".csv,text/csv",
        extension: ".csv",
        format: "CSV header names (case-insensitive)",
        columns: "username, password, fullName, email, rollNumber, departmentId, programId, semesterId, cohortId, sectionId"
    },
    {
        id: "students-excel",
        title: "Students - Excel",
        endpoint: "/api/admin/students/import-excel",
        accept: ".xls,.xlsx",
        extension: ".xls or .xlsx",
        format: "Columns in order after the header row",
        columns: "username, password, fullName, email, rollNumber, departmentId, programId, semesterId, cohortId, sectionId"
    },
    {
        id: "faculty-csv",
        title: "Faculty - CSV",
        endpoint: "/api/admin/faculty/import",
        accept: ".csv,text/csv",
        extension: ".csv",
        format: "CSV header names (case-insensitive)",
        columns: "username, password, fullName, email, employeeId, designation, departmentId"
    },
    {
        id: "faculty-excel",
        title: "Faculty - Excel",
        endpoint: "/api/admin/faculty/import-excel",
        accept: ".xls,.xlsx",
        extension: ".xls or .xlsx",
        format: "Columns in order after the header row",
        columns: "username, password, fullName, email, employeeId, designation, departmentId"
    }
];

function ImportCard({ option }) {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;
        setError("");
        setResult(null);
        setProgress(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const fileName = selectedFile.name.toLowerCase();
        const extensions = option.extension.split(" or ");
        if (!extensions.some((extension) => fileName.endsWith(extension))) {
            setFile(null);
            setError(`Choose a file with the ${option.extension} extension.`);
            event.target.value = "";
            return;
        }

        if (selectedFile.size === 0) {
            setFile(null);
            setError("The selected file is empty.");
            event.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const clearSelection = () => {
        if (uploading) {
            return;
        }

        setFile(null);
        setProgress(null);
        setResult(null);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file) {
            setError("Select a file before starting the import.");
            return;
        }

        setUploading(true);
        setError("");
        setResult(null);
        setProgress(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post(option.endpoint, formData, {
                onUploadProgress: (event) => {
                    if (event.total) {
                        setProgress(Math.round((event.loaded * 100) / event.total));
                    }
                }
            });
            setProgress(100);
            setResult(response.data);
        } catch (requestError) {
            console.error(`${option.title} import error:`, requestError);
            const responseData = requestError.response?.data;
            setError(
                responseData?.message ||
                (typeof responseData === "string" ? responseData : "") ||
                "Unable to import this file."
            );
            if (Array.isArray(responseData?.errors)) {
                setResult(responseData);
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="import-card">
            <h2>{option.title}</h2>
            <p className="import-format">{option.format}</p>
            <p className="import-columns">
                <strong>Fields:</strong> {option.columns}
            </p>

            <form onSubmit={handleUpload}>
                <div className="form-group">
                    <label htmlFor={`${option.id}-file`}>Choose {option.extension} file</label>
                    <input
                        ref={fileInputRef}
                        id={`${option.id}-file`}
                        type="file"
                        accept={option.accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>

                {file && <p className="selected-file">Selected: {file.name}</p>}

                {progress !== null && (
                    <div className="upload-progress">
                        <progress value={progress} max="100" aria-label={`${option.title} upload progress`} />
                        <span>{progress}% uploaded</span>
                    </div>
                )}

                {error && <div className="error-message" role="alert">{error}</div>}

                {result && (
                    <div className={result.failedRows > 0 ? "import-result import-result-warning" : "import-result"} role="status">
                        <strong>Import finished</strong>
                        <p>
                            Imported {result.successfulRows ?? 0} of {result.totalRows ?? 0} rows.
                            {result.failedRows > 0 && ` ${result.failedRows} row(s) failed.`}
                        </p>
                        {Array.isArray(result.errors) && result.errors.length > 0 && (
                            <details>
                                <summary>Show {result.errors.length} import message(s)</summary>
                                <ul>
                                    {result.errors.map((message, index) => (
                                        <li key={`${index}-${message}`}>{message}</li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={uploading || !file}
                    >
                        {uploading ? "Importing..." : "Import file"}
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={clearSelection}
                        disabled={uploading || (!file && !result && !error)}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </section>
    );
}

function AdminBulkImport() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("edumind_role") !== "ADMIN") {
            navigate("/admin/login");
        }
    }, [navigate]);

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Bulk Import</h1>
                        <p>Import students and faculty using the existing CSV and Excel APIs</p>
                    </div>
                </div>

                <div className="import-notice">
                    For student imports, include cohortId and sectionId after semesterId to place students
                    in their academic cohort and section. These must be numeric Import IDs shown in the
                    Admin Cohorts &amp; Sections tables and must belong to the selected program and semester.
                    Leave both
                    fields blank only when intentionally importing unplaced legacy records; older files
                    without these columns remain supported. Each row is validated and the result lists
                    row-level errors.
                </div>

                <div className="import-grid">
                    {importOptions.map((option) => (
                        <ImportCard key={option.id} option={option} />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminBulkImport;
