import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminPrograms() {
    const navigate = useNavigate();

    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [formMessageType, setFormMessageType] = useState("success");
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        departmentId: ""
    });

    const fetchPrograms = useCallback(async () => {
        const response = await api.get("/api/admin/programs");
        return response.data;
    }, []);

    const fetchDepartments = useCallback(async () => {
        const response = await api.get("/api/admin/departments");
        return response.data;
    }, []);

    const loadPrograms = async () => {
        try {
            setPrograms(await fetchPrograms());
            setError("");
        } catch (requestError) {
            console.error("Programs error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to load programs."
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
                const [programData, departmentData] = await Promise.all([
                    fetchPrograms(),
                    fetchDepartments()
                ]);

                if (!cancelled) {
                    setPrograms(programData);
                    setDepartments(departmentData);
                }
            } catch (requestError) {
                console.error("Programs page load error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load programs or departments."
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
    }, [navigate, fetchPrograms, fetchDepartments]);

    const filteredPrograms = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return programs;
        }

        return programs.filter((program) =>
            program.name?.toLowerCase().includes(query) ||
            program.code?.toLowerCase().includes(query)
        );
    }, [programs, searchTerm]);

    const resetForm = () => {
        setFormData({ name: "", code: "", departmentId: "" });
        setEditingProgram(null);
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setNotice("");
        setShowForm(true);
    };

    const openEditForm = (program) => {
        setEditingProgram(program);
        setFormData({
            name: program.name || "",
            code: program.code || "",
            departmentId: String(program.department?.id ?? program.departmentId ?? "")
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
        setSaving(true);
        setFormMessage("");
        setNotice("");
        setError("");

        const requestData = {
            name: formData.name.trim(),
            code: formData.code.trim(),
            departmentId: Number(formData.departmentId)
        };

        const duplicateCode = programs.some((program) =>
            program.id !== editingProgram?.id &&
            program.code?.trim().toLowerCase() === requestData.code.toLowerCase()
        );

        if (duplicateCode) {
            setFormMessageType("error");
            setFormMessage("A program with this code already exists.");
            setSaving(false);
            return;
        }

        try {
            if (editingProgram) {
                await api.put(
                    `/api/admin/programs/${editingProgram.id}`,
                    requestData
                );
            } else {
                await api.post("/api/admin/programs", requestData);
            }

            await loadPrograms();
            setNotice(
                editingProgram
                    ? "Program updated successfully."
                    : "Program created successfully."
            );
            closeForm();
        } catch (requestError) {
            console.error("Save program error:", requestError);
            setFormMessageType("error");
            setFormMessage(
                requestError.response?.data?.message ||
                "Unable to save program."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (program) => {
        const departmentName = program.department?.name || "its department";
        const confirmed = window.confirm(
            `Delete program ${program.name} (${program.code}) from ${departmentName}? The server will enforce existing relationship constraints.`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(program.id);
        setError("");
        setNotice("");

        try {
            await api.delete(`/api/admin/programs/${program.id}`);
            await loadPrograms();
            setNotice("Program deleted successfully.");
        } catch (requestError) {
            console.error("Delete program error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to delete program."
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
                        <h1>Programs</h1>
                        <p>Manage academic programs and their departments</p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={showForm ? closeForm : openAddForm}
                        disabled={departments.length === 0}
                        title={departments.length === 0 ? "Add a department first" : undefined}
                    >
                        {showForm ? "Close Form" : "+ Add Program"}
                    </button>
                </div>

                {notice && <div className="form-message">{notice}</div>}
                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h2>{editingProgram ? "Edit Program" : "Add Program"}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="program-name">Program name</label>
                                    <input
                                        id="program-name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="program-code">Program code</label>
                                    <input
                                        id="program-code"
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        maxLength={20}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="program-department">Department</label>
                                    <select
                                        id="program-department"
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.name} ({department.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {formMessage && (
                                <div className={formMessageType === "error" ? "error-message" : "form-message"}>
                                    {formMessage}
                                </div>
                            )}

                            <div className="form-actions">
                                <button className="primary-button" type="submit" disabled={saving || departments.length === 0}>
                                    {saving ? "Saving..." : editingProgram ? "Update Program" : "Create Program"}
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
                        <label htmlFor="program-search">Search programs</label>
                        <input
                            id="program-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by program name or code..."
                        />
                    </div>

                    <div className="result-count">
                        Showing <strong>{filteredPrograms.length}</strong> of{" "}
                        <strong>{programs.length}</strong> programs
                    </div>
                </div>

                {loading && <div className="loading">Loading programs...</div>}

                {!loading && !error && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Program</th>
                                    <th>Code</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPrograms.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            {programs.length === 0
                                                ? "No programs have been added yet."
                                                : "No programs match your search."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPrograms.map((program) => (
                                        <tr key={program.id}>
                                            <td>{program.id}</td>
                                            <td>{program.name}</td>
                                            <td>{program.code}</td>
                                            <td>{program.department?.name || "—"}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() => openEditForm(program)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => handleDelete(program)}
                                                        disabled={deletingId === program.id}
                                                    >
                                                        {deletingId === program.id ? "Deleting..." : "Delete"}
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

export default AdminPrograms;
