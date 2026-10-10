import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminFacultyAllocation() {
    const navigate = useNavigate();
    const [allocations, setAllocations] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({ facultyId: "", courseId: "" });

    const fetchAllocations = useCallback(async () => {
        const response = await api.get("/api/admin/faculty-allocations");
        return response.data;
    }, []);

    const fetchFaculty = useCallback(async () => {
        const response = await api.get("/api/admin/faculty");
        return response.data;
    }, []);

    const fetchCourses = useCallback(async () => {
        const response = await api.get("/api/admin/courses");
        return response.data;
    }, []);

    const loadData = async () => {
        try {
            const [allocationData, facultyData, courseData] = await Promise.all([
                fetchAllocations(),
                fetchFaculty(),
                fetchCourses()
            ]);
            setAllocations(allocationData);
            setFaculty(facultyData);
            setCourses(courseData);
            setError("");
        } catch (requestError) {
            console.error("Faculty allocation error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to load faculty allocations, faculty, or courses."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("edumind_role") !== "ADMIN") {
            navigate("/admin/login");
            return;
        }

        let cancelled = false;
        const loadInitialData = async () => {
            try {
                const [allocationData, facultyData, courseData] = await Promise.all([
                    fetchAllocations(),
                    fetchFaculty(),
                    fetchCourses()
                ]);
                if (!cancelled) {
                    setAllocations(allocationData);
                    setFaculty(facultyData);
                    setCourses(courseData);
                }
            } catch (requestError) {
                console.error("Faculty allocation page load error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load faculty allocations, faculty, or courses."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();
        return () => {
            cancelled = true;
        };
    }, [navigate, fetchAllocations, fetchFaculty, fetchCourses]);

    const filteredAllocations = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return allocations;
        }

        return allocations.filter((allocation) => [
            allocation.facultyName,
            allocation.employeeId,
            allocation.courseName,
            allocation.courseCode
        ].some((value) => value?.toLowerCase().includes(query)));
    }, [allocations, searchTerm]);

    const resetForm = () => {
        setFormData({ facultyId: "", courseId: "" });
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setNotice("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormMessage("");
        setNotice("");
        setError("");

        const facultyId = Number(formData.facultyId);
        const courseId = Number(formData.courseId);
        if (!facultyId || !courseId) {
            setFormMessage("Select both a faculty member and a course.");
            return;
        }

        if (allocations.some((allocation) =>
            allocation.facultyId === facultyId && allocation.courseId === courseId
        )) {
            setFormMessage("This faculty member is already assigned to this course.");
            return;
        }

        const selectedFaculty = faculty.find((item) => item.id === facultyId);
        const selectedCourse = courses.find((item) => item.id === courseId);
        const courseDepartmentId = selectedCourse?.semester?.program?.department?.id;
        if (
            selectedFaculty?.departmentId != null &&
            courseDepartmentId != null &&
            selectedFaculty.departmentId !== courseDepartmentId
        ) {
            setFormMessage("Faculty and course must belong to the same department.");
            return;
        }

        setSaving(true);
        try {
            await api.post("/api/admin/faculty-allocations", {
                facultyId,
                courseId
            });
            closeForm();
            setNotice("Faculty course allocation created successfully.");
            await loadData();
        } catch (requestError) {
            console.error("Create faculty allocation error:", requestError);
            setFormMessage(
                requestError.response?.data?.message ||
                "Unable to create faculty allocation."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (allocation) => {
        const confirmed = window.confirm(
            `Remove ${allocation.facultyName} from ${allocation.courseName} (${allocation.courseCode})?`
        );
        if (!confirmed) {
            return;
        }

        setDeletingId(allocation.id);
        setError("");
        setNotice("");
        try {
            await api.delete(`/api/admin/faculty-allocations/${allocation.id}`);
            setNotice("Faculty course allocation removed successfully.");
            await loadData();
        } catch (requestError) {
            console.error("Delete faculty allocation error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to remove faculty allocation."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const canCreateAllocation = faculty.length > 0 && courses.length > 0;

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Faculty Allocation</h1>
                        <p>Assign faculty to courses in their department</p>
                    </div>
                    <button
                        className="primary-button"
                        onClick={showForm ? closeForm : openAddForm}
                        disabled={!canCreateAllocation && !showForm}
                        title={!canCreateAllocation ? "Add faculty and courses first" : undefined}
                    >
                        {showForm ? "Close Form" : "+ Add Allocation"}
                    </button>
                </div>

                {!canCreateAllocation && !loading && (
                    <div className="error-message">
                        Add at least one faculty member and one course before creating an allocation.
                    </div>
                )}
                {notice && <div className="form-message" role="status">{notice}</div>}
                {error && <div className="error-message" role="alert">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h2>Assign Faculty to Course</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="allocation-faculty">Faculty</label>
                                    <select
                                        id="allocation-faculty"
                                        value={formData.facultyId}
                                        onChange={(event) => setFormData((previous) => ({
                                            ...previous,
                                            facultyId: event.target.value
                                        }))}
                                        required
                                    >
                                        <option value="">Select faculty</option>
                                        {faculty.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.fullName} ({member.employeeId}) - {member.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="allocation-course">Course</label>
                                    <select
                                        id="allocation-course"
                                        value={formData.courseId}
                                        onChange={(event) => setFormData((previous) => ({
                                            ...previous,
                                            courseId: event.target.value
                                        }))}
                                        required
                                    >
                                        <option value="">Select course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.name} ({course.code}) - {course.semester?.program?.name}
                                                {" / "}Semester {course.semester?.semesterNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {formMessage && <div className="error-message" role="alert">{formMessage}</div>}
                            <div className="form-actions">
                                <button
                                    className="primary-button"
                                    type="submit"
                                    disabled={saving || !canCreateAllocation}
                                >
                                    {saving ? "Saving..." : "Create Allocation"}
                                </button>
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="filter-card">
                    <div className="search-box">
                        <label htmlFor="allocation-search">Search allocations</label>
                        <input
                            id="allocation-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by faculty name, employee ID, course, or course code..."
                        />
                    </div>
                    <div className="result-count">
                        Showing <strong>{filteredAllocations.length}</strong> of{" "}
                        <strong>{allocations.length}</strong> allocations
                    </div>
                </div>

                {loading && <div className="loading">Loading faculty allocations...</div>}
                {!loading && !error && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Faculty</th>
                                    <th>Employee ID</th>
                                    <th>Course</th>
                                    <th>Course Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAllocations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            {allocations.length === 0
                                                ? "No faculty course allocations have been added yet."
                                                : "No allocations match your search."}
                                        </td>
                                    </tr>
                                ) : filteredAllocations.map((allocation) => (
                                    <tr key={allocation.id}>
                                        <td>{allocation.id}</td>
                                        <td>{allocation.facultyName}</td>
                                        <td>{allocation.employeeId}</td>
                                        <td>{allocation.courseName}</td>
                                        <td>{allocation.courseCode}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() => handleDelete(allocation)}
                                                disabled={deletingId === allocation.id}
                                            >
                                                {deletingId === allocation.id ? "Removing..." : "Remove"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminFacultyAllocation;
