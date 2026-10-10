import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminAcademicYears() {
    const navigate = useNavigate();

    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [formMessageType, setFormMessageType] = useState("success");
    const [showForm, setShowForm] = useState(false);
    const [editingAcademicYear, setEditingAcademicYear] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({ name: "" });

    const fetchAcademicYears = useCallback(async () => {
        const response = await api.get("/api/admin/academic-years");
        return response.data;
    }, []);

    const loadAcademicYears = async () => {
        try {
            setAcademicYears(await fetchAcademicYears());
            setError("");
        } catch (requestError) {
            console.error("Academic years error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to load academic years."
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
                const data = await fetchAcademicYears();
                if (!cancelled) {
                    setAcademicYears(data);
                }
            } catch (requestError) {
                console.error("Academic years error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load academic years."
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
    }, [navigate, fetchAcademicYears]);

    const filteredAcademicYears = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return academicYears;
        }

        return academicYears.filter((academicYear) =>
            academicYear.name?.toLowerCase().includes(query)
        );
    }, [academicYears, searchTerm]);

    const resetForm = () => {
        setFormData({ name: "" });
        setEditingAcademicYear(null);
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setNotice("");
        setShowForm(true);
    };

    const openEditForm = (academicYear) => {
        setEditingAcademicYear(academicYear);
        setFormData({ name: academicYear.name || "" });
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
        setSaving(true);
        setFormMessage("");
        setNotice("");
        setError("");

        const requestData = { name: formData.name.trim() };

        const duplicateName = academicYears.some((academicYear) =>
            academicYear.id !== editingAcademicYear?.id &&
            academicYear.name?.trim().toLowerCase() === requestData.name.toLowerCase()
        );

        if (duplicateName) {
            setFormMessageType("error");
            setFormMessage("An academic year with this name already exists.");
            setSaving(false);
            return;
        }

        try {
            if (editingAcademicYear) {
                await api.put(
                    `/api/admin/academic-years/${editingAcademicYear.id}`,
                    requestData
                );
            } else {
                await api.post("/api/admin/academic-years", requestData);
            }

            await loadAcademicYears();
            setNotice(
                editingAcademicYear
                    ? "Academic year updated successfully."
                    : "Academic year created successfully."
            );
            closeForm();
        } catch (requestError) {
            console.error("Save academic year error:", requestError);
            setFormMessageType("error");
            setFormMessage(
                requestError.response?.data?.message ||
                "Unable to save academic year."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (academicYear) => {
        const confirmed = window.confirm(
            `Delete academic year ${academicYear.name}? Academic years referenced by semesters cannot be deleted.`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(academicYear.id);
        setError("");
        setNotice("");

        try {
            await api.delete(`/api/admin/academic-years/${academicYear.id}`);
            await loadAcademicYears();
            setNotice("Academic year deleted successfully.");
        } catch (requestError) {
            console.error("Delete academic year error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to delete academic year."
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Academic Years</h1>
                        <p>Manage academic years for EduMind programs</p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={showForm ? closeForm : openAddForm}
                    >
                        {showForm ? "Close Form" : "+ Add Academic Year"}
                    </button>
                </div>

                {notice && <div className="form-message">{notice}</div>}
                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h2>{editingAcademicYear ? "Edit Academic Year" : "Add Academic Year"}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="academic-year-name">Academic year name</label>
                                    <input
                                        id="academic-year-name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={20}
                                        placeholder="e.g. 2026-27"
                                        required
                                    />
                                </div>
                            </div>

                            {formMessage && (
                                <div className={formMessageType === "error" ? "error-message" : "form-message"}>
                                    {formMessage}
                                </div>
                            )}

                            <div className="form-actions">
                                <button className="primary-button" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : editingAcademicYear ? "Update Academic Year" : "Create Academic Year"}
                                </button>
                                <button className="secondary-button" type="button" onClick={closeForm} disabled={saving}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="filter-card">
                    <div className="search-box">
                        <label htmlFor="academic-year-search">Search academic years</label>
                        <input
                            id="academic-year-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by academic year name..."
                        />
                    </div>

                    <div className="result-count">
                        Showing <strong>{filteredAcademicYears.length}</strong> of{" "}
                        <strong>{academicYears.length}</strong> academic years
                    </div>
                </div>

                {loading && <div className="loading">Loading academic years...</div>}

                {!loading && !error && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Academic Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAcademicYears.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="empty-state">
                                            {academicYears.length === 0
                                                ? "No academic years have been added yet."
                                                : "No academic years match your search."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAcademicYears.map((academicYear) => (
                                        <tr key={academicYear.id}>
                                            <td>{academicYear.id}</td>
                                            <td>{academicYear.name}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() => openEditForm(academicYear)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => handleDelete(academicYear)}
                                                        disabled={deletingId === academicYear.id}
                                                    >
                                                        {deletingId === academicYear.id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminAcademicYears;
