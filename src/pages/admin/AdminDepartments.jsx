import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminDepartments() {
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [formMessageType, setFormMessageType] = useState("success");
    const [showForm, setShowForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({ name: "", code: "" });

    const fetchDepartments = useCallback(async () => {
        const response = await api.get("/api/admin/departments");
        return response.data;
    }, []);

    const loadDepartments = async () => {
        try {
            setDepartments(await fetchDepartments());
            setError("");
        } catch (requestError) {
            console.error("Departments error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to load departments."
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

        const loadInitialDepartments = async () => {
            try {
                const data = await fetchDepartments();
                if (!cancelled) {
                    setDepartments(data);
                }
            } catch (requestError) {
                console.error("Departments error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load departments."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadInitialDepartments();

        return () => {
            cancelled = true;
        };
    }, [navigate, fetchDepartments]);

    const filteredDepartments = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return departments;
        }

        return departments.filter((department) =>
            department.name?.toLowerCase().includes(query) ||
            department.code?.toLowerCase().includes(query)
        );
    }, [departments, searchTerm]);

    const resetForm = () => {
        setFormData({ name: "", code: "" });
        setEditingDepartment(null);
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setNotice("");
        setShowForm(true);
    };

    const openEditForm = (department) => {
        setEditingDepartment(department);
        setFormData({ name: department.name || "", code: department.code || "" });
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

        const requestData = {
            name: formData.name.trim(),
            code: formData.code.trim()
        };

        try {
            if (editingDepartment) {
                await api.put(
                    `/api/admin/departments/${editingDepartment.id}`,
                    requestData
                );
            } else {
                await api.post("/api/admin/departments", requestData);
            }

            await loadDepartments();
            setNotice(
                editingDepartment
                    ? "Department updated successfully."
                    : "Department created successfully."
            );
            closeForm();
        } catch (requestError) {
            console.error("Save department error:", requestError);
            setFormMessageType("error");
            setFormMessage(
                requestError.response?.data?.message ||
                "Unable to save department."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (department) => {
        const confirmed = window.confirm(
            `Delete department ${department.name} (${department.code})? Departments with assigned programs or faculty cannot be deleted.`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(department.id);
        setError("");
        setNotice("");

        try {
            await api.delete(`/api/admin/departments/${department.id}`);
            await loadDepartments();
            setNotice("Department deleted successfully.");
        } catch (requestError) {
            console.error("Delete department error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to delete department."
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
                        <h1>Departments</h1>
                        <p>Manage academic departments in EduMind</p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={showForm ? closeForm : openAddForm}
                    >
                        {showForm ? "Close Form" : "+ Add Department"}
                    </button>
                </div>

                {notice && <div className="form-message">{notice}</div>}
                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h2>{editingDepartment ? "Edit Department" : "Add Department"}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="department-name">Department name</label>
                                    <input
                                        id="department-name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="department-code">Department code</label>
                                    <input
                                        id="department-code"
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        maxLength={20}
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
                                    {saving ? "Saving..." : editingDepartment ? "Update Department" : "Create Department"}
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
                        <label htmlFor="department-search">Search departments</label>
                        <input
                            id="department-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by department name or code..."
                        />
                    </div>

                    <div className="result-count">
                        Showing <strong>{filteredDepartments.length}</strong> of{" "}
                        <strong>{departments.length}</strong> departments
                    </div>
                </div>

                {loading && <div className="loading">Loading departments...</div>}

                {!loading && !error && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Department</th>
                                    <th>Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="empty-state">
                                            {departments.length === 0
                                                ? "No departments have been added yet."
                                                : "No departments match your search."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDepartments.map((department) => (
                                        <tr key={department.id}>
                                            <td>{department.id}</td>
                                            <td>{department.name}</td>
                                            <td>{department.code}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() => openEditForm(department)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => handleDelete(department)}
                                                        disabled={deletingId === department.id}
                                                    >
                                                        {deletingId === department.id ? "Deleting..." : "Delete"}
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

export default AdminDepartments;
