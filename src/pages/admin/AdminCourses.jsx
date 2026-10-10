import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        credits: "",
        semesterId: ""
    });

    const fetchCourses = useCallback(async () => {
        const response = await api.get("/api/admin/courses");
        return response.data;
    }, []);

    const fetchSemesters = useCallback(async () => {
        const response = await api.get("/api/admin/semesters");
        return response.data;
    }, []);

    const loadCourses = async () => {
        try {
            const [courseData, semesterData] = await Promise.all([
                fetchCourses(),
                fetchSemesters()
            ]);
            setCourses(courseData);
            setSemesters(semesterData);
            setError("");
        } catch (requestError) {
            console.error("Courses error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to load courses or semesters."
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
                const [courseData, semesterData] = await Promise.all([
                    fetchCourses(),
                    fetchSemesters()
                ]);
                if (!cancelled) {
                    setCourses(courseData);
                    setSemesters(semesterData);
                }
            } catch (requestError) {
                console.error("Courses page load error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load courses or semesters."
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
    }, [navigate, fetchCourses, fetchSemesters]);

    const filteredCourses = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return courses;
        }

        return courses.filter((course) => [
            course.name,
            course.code,
            String(course.credits),
            String(course.semester?.semesterNumber),
            course.semester?.program?.name,
            course.semester?.program?.code,
            course.semester?.academicYear?.name
        ].some((value) => value?.toLowerCase().includes(query)));
    }, [courses, searchTerm]);

    const resetForm = () => {
        setFormData({ name: "", code: "", credits: "", semesterId: "" });
        setEditingCourse(null);
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setNotice("");
        setShowForm(true);
    };

    const openEditForm = (course) => {
        setEditingCourse(course);
        setFormData({
            name: course.name || "",
            code: course.code || "",
            credits: String(course.credits ?? ""),
            semesterId: String(course.semester?.id ?? "")
        });
        setFormMessage("");
        setNotice("");
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const closeForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormMessage("");
        setNotice("");
        setError("");

        const requestData = {
            name: formData.name.trim(),
            code: formData.code.trim(),
            credits: Number(formData.credits),
            semesterId: Number(formData.semesterId)
        };
        const duplicateCode = courses.some((course) =>
            course.id !== editingCourse?.id &&
            course.code?.trim().toLowerCase() === requestData.code.toLowerCase()
        );

        if (duplicateCode) {
            setFormMessage("A course with this code already exists.");
            return;
        }

        setSaving(true);
        try {
            if (editingCourse) {
                await api.put(
                    `/api/admin/courses/${editingCourse.id}`,
                    requestData
                );
            } else {
                await api.post("/api/admin/courses", requestData);
            }

            closeForm();
            setNotice(
                editingCourse
                    ? "Course updated successfully."
                    : "Course created successfully."
            );
            await loadCourses();
        } catch (requestError) {
            console.error("Save course error:", requestError);
            setFormMessage(
                requestError.response?.data?.message ||
                "Unable to save course."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course) => {
        const confirmed = window.confirm(
            `Delete course ${course.name} (${course.code})? Courses with faculty allocations cannot be deleted.`
        );
        if (!confirmed) {
            return;
        }

        setDeletingId(course.id);
        setError("");
        setNotice("");
        try {
            await api.delete(`/api/admin/courses/${course.id}`);
            setNotice("Course deleted successfully.");
            await loadCourses();
        } catch (requestError) {
            console.error("Delete course error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to delete course."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const canManageCourses = semesters.length > 0;

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Courses</h1>
                        <p>Manage course details and their program semesters</p>
                    </div>
                    <button
                        className="primary-button"
                        onClick={showForm ? closeForm : openAddForm}
                        disabled={!canManageCourses && !showForm}
                        title={!canManageCourses ? "Add a semester first" : undefined}
                    >
                        {showForm ? "Close Form" : "+ Add Course"}
                    </button>
                </div>

                {!canManageCourses && !loading && (
                    <div className="error-message">
                        Add a semester before creating courses.
                    </div>
                )}
                {notice && <div className="form-message" role="status">{notice}</div>}
                {error && <div className="error-message" role="alert">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h2>{editingCourse ? "Edit Course" : "Add Course"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="course-name">Course name</label>
                                    <input
                                        id="course-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={150}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="course-code">Course code</label>
                                    <input
                                        id="course-code"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        maxLength={20}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="course-credits">Credits</label>
                                    <input
                                        id="course-credits"
                                        type="number"
                                        name="credits"
                                        value={formData.credits}
                                        onChange={handleChange}
                                        min={1}
                                        max={10}
                                        step={1}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="course-semester">Semester</label>
                                    <select
                                        id="course-semester"
                                        name="semesterId"
                                        value={formData.semesterId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select semester</option>
                                        {semesters.map((semester) => (
                                            <option key={semester.id} value={semester.id}>
                                                Semester {semester.semesterNumber} - {semester.program?.name}
                                                {" "}({semester.academicYear?.name})
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
                                    disabled={saving || !canManageCourses}
                                >
                                    {saving ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
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
                        <label htmlFor="course-search">Search courses</label>
                        <input
                            id="course-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, code, credits, semester, program, or year..."
                        />
                    </div>
                    <div className="result-count">
                        Showing <strong>{filteredCourses.length}</strong> of{" "}
                        <strong>{courses.length}</strong> courses
                    </div>
                </div>

                {loading && <div className="loading">Loading courses...</div>}
                {!loading && !error && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Course</th>
                                    <th>Code</th>
                                    <th>Credits</th>
                                    <th>Semester</th>
                                    <th>Program</th>
                                    <th>Academic Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="empty-state">
                                            {courses.length === 0
                                                ? "No courses have been added yet."
                                                : "No courses match your search."}
                                        </td>
                                    </tr>
                                ) : filteredCourses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.id}</td>
                                        <td>{course.name}</td>
                                        <td>{course.code}</td>
                                        <td>{course.credits}</td>
                                        <td>{course.semester?.semesterNumber}</td>
                                        <td>{course.semester?.program?.name}</td>
                                        <td>{course.semester?.academicYear?.name}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() => openEditForm(course)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() => handleDelete(course)}
                                                    disabled={deletingId === course.id}
                                                >
                                                    {deletingId === course.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
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

export default AdminCourses;
