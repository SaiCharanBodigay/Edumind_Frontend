import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminSemesters() {
    const navigate = useNavigate();

    const [semesters, setSemesters] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [formMessage, setFormMessage] = useState("");
    const [formMessageType, setFormMessageType] = useState("success");
    const [showForm, setShowForm] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterProgramId, setFilterProgramId] = useState("");
    const [filterAcademicYearId, setFilterAcademicYearId] = useState("");
    const [formData, setFormData] = useState({
        semesterNumber: "",
        programId: "",
        academicYearId: ""
    });

    const fetchSemesters = useCallback(async () => {
        const response = await api.get("/api/admin/semesters");
        return response.data;
    }, []);

    const fetchPrograms = useCallback(async () => {
        const response = await api.get("/api/admin/programs");
        return response.data;
    }, []);

    const fetchAcademicYears = useCallback(async () => {
        const response = await api.get("/api/admin/academic-years");
        return response.data;
    }, []);

    const loadSemesters = async () => {
        try {
            setSemesters(await fetchSemesters());
            setError("");
        } catch (requestError) {
            console.error("Semesters error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to load semesters."
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
                const [semesterData, programData, academicYearData] = await Promise.all([
                    fetchSemesters(),
                    fetchPrograms(),
                    fetchAcademicYears()
                ]);

                if (!cancelled) {
                    setSemesters(semesterData);
                    setPrograms(programData);
                    setAcademicYears(academicYearData);
                }
            } catch (requestError) {
                console.error("Semesters page load error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load semesters, programs, or academic years."
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
    }, [navigate, fetchSemesters, fetchPrograms, fetchAcademicYears]);

    const filteredSemesters = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return semesters.filter((semester) => {
            const matchesSearch = !query || [
                String(semester.semesterNumber),
                semester.program?.name,
                semester.program?.code,
                semester.academicYear?.name
            ].some((value) => value?.toLowerCase().includes(query));

            const matchesProgram = !filterProgramId ||
                String(semester.program?.id) === filterProgramId;

            const matchesAcademicYear = !filterAcademicYearId ||
                String(semester.academicYear?.id) === filterAcademicYearId;

            return matchesSearch && matchesProgram && matchesAcademicYear;
        });
    }, [semesters, searchTerm, filterProgramId, filterAcademicYearId]);

    const resetForm = () => {
        setFormData({ semesterNumber: "", programId: "", academicYearId: "" });
        setEditingSemester(null);
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setNotice("");
        setShowForm(true);
    };

    const openEditForm = (semester) => {
        setEditingSemester(semester);
        setFormData({
            semesterNumber: String(semester.semesterNumber ?? ""),
            programId: String(semester.program?.id ?? ""),
            academicYearId: String(semester.academicYear?.id ?? "")
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

    const clearFilters = () => {
        setSearchTerm("");
        setFilterProgramId("");
        setFilterAcademicYearId("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFormMessage("");
        setNotice("");
        setError("");

        const semesterNumber = Number(formData.semesterNumber);

        if (semesterNumber < 1 || semesterNumber > 8) {
            setFormMessageType("error");
            setFormMessage("Semester number must be between 1 and 8.");
            setSaving(false);
            return;
        }

        const requestData = {
            semesterNumber,
            programId: Number(formData.programId),
            academicYearId: Number(formData.academicYearId)
        };

        try {
            if (editingSemester) {
                await api.put(
                    `/api/admin/semesters/${editingSemester.id}`,
                    requestData
                );
            } else {
                await api.post("/api/admin/semesters", requestData);
            }

            await loadSemesters();
            setNotice(
                editingSemester
                    ? "Semester updated successfully."
                    : "Semester created successfully."
            );
            closeForm();
        } catch (requestError) {
            console.error("Save semester error:", requestError);
            setFormMessageType("error");
            setFormMessage(
                requestError.response?.data?.message ||
                "Unable to save semester."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (semester) => {
        const programName = semester.program?.name || "its program";
        const academicYearName = semester.academicYear?.name || "its academic year";
        const confirmed = window.confirm(
            `Delete semester ${semester.semesterNumber} for ${programName} (${academicYearName})? Semesters referenced by courses or students cannot be deleted.`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(semester.id);
        setError("");
        setNotice("");

        try {
            await api.delete(`/api/admin/semesters/${semester.id}`);
            await loadSemesters();
            setNotice("Semester deleted successfully.");
        } catch (requestError) {
            console.error("Delete semester error:", requestError);
            setError(
                requestError.response?.data?.message ||
                "Unable to delete semester."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const canAddSemester = programs.length > 0 && academicYears.length > 0;

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>Semesters</h1>
                        <p>Manage semesters by program and academic year</p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={showForm ? closeForm : openAddForm}
                        disabled={!canAddSemester && !showForm}
                    >
                        {showForm ? "Close Form" : "+ Add Semester"}
                    </button>
                </div>

                {!canAddSemester && !loading && (
                    <div className="error-message">
                        Add at least one program and one academic year before creating semesters.
                    </div>
                )}

                {notice && <div className="form-message">{notice}</div>}
                {error && <div className="error-message">{error}</div>}

                {showForm && (
                    <div className="form-card">
                        <h2>{editingSemester ? "Edit Semester" : "Add Semester"}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="semester-number">Semester number</label>
                                    <input
                                        id="semester-number"
                                        type="number"
                                        name="semesterNumber"
                                        value={formData.semesterNumber}
                                        onChange={handleChange}
                                        min={1}
                                        max={8}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="semester-program">Program</label>
                                    <select
                                        id="semester-program"
                                        name="programId"
                                        value={formData.programId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select program</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name} ({program.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="semester-academic-year">Academic year</label>
                                    <select
                                        id="semester-academic-year"
                                        name="academicYearId"
                                        value={formData.academicYearId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select academic year</option>
                                        {academicYears.map((academicYear) => (
                                            <option key={academicYear.id} value={academicYear.id}>
                                                {academicYear.name}
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
                                <button className="primary-button" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : editingSemester ? "Update Semester" : "Create Semester"}
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
                        <label htmlFor="semester-search">Search semesters</label>
                        <input
                            id="semester-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by semester, program, or academic year..."
                        />
                    </div>

                    <div className="filter-grid">
                        <div className="form-group">
                            <label htmlFor="filter-program">Filter by program</label>
                            <select
                                id="filter-program"
                                value={filterProgramId}
                                onChange={(event) => setFilterProgramId(event.target.value)}
                            >
                                <option value="">All programs</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="filter-academic-year">Filter by academic year</label>
                            <select
                                id="filter-academic-year"
                                value={filterAcademicYearId}
                                onChange={(event) => setFilterAcademicYearId(event.target.value)}
                            >
                                <option value="">All academic years</option>
                                {academicYears.map((academicYear) => (
                                    <option key={academicYear.id} value={academicYear.id}>
                                        {academicYear.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="secondary-button" type="button" onClick={clearFilters}>
                            Clear filters
                        </button>
                    </div>

                    <div className="result-count">
                        Showing <strong>{filteredSemesters.length}</strong> of{" "}
                        <strong>{semesters.length}</strong> semesters
                    </div>
                </div>

                {loading && <div className="loading">Loading semesters...</div>}

                {!loading && !error && (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Semester</th>
                                    <th>Program</th>
                                    <th>Academic Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSemesters.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            {semesters.length === 0
                                                ? "No semesters have been added yet."
                                                : "No semesters match your search or filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSemesters.map((semester) => (
                                        <tr key={semester.id}>
                                            <td>{semester.id}</td>
                                            <td>{semester.semesterNumber}</td>
                                            <td>
                                                {semester.program?.name}
                                                {semester.program?.code ? ` (${semester.program.code})` : ""}
                                            </td>
                                            <td>{semester.academicYear?.name}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() => openEditForm(semester)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => handleDelete(semester)}
                                                        disabled={deletingId === semester.id}
                                                    >
                                                        {deletingId === semester.id ? "Deleting..." : "Delete"}
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

export default AdminSemesters;
