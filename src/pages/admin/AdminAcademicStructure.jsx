import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminAcademicStructure() {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [sections, setSections] = useState([]);
    const [programId, setProgramId] = useState("");
    const [cohortId, setCohortId] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [cohortName, setCohortName] = useState("");
    const [sectionName, setSectionName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadLists = useCallback(async () => {
        const [programResponse, semesterResponse, cohortResponse, sectionResponse] =
            await Promise.all([
                api.get("/api/admin/programs"),
                api.get("/api/admin/semesters"),
                api.get("/api/admin/cohorts"),
                api.get("/api/admin/sections")
            ]);
        setPrograms(programResponse.data);
        setSemesters(semesterResponse.data);
        setCohorts(cohortResponse.data);
        setSections(sectionResponse.data);
    }, []);

    useEffect(() => {
        if (localStorage.getItem("edumind_role") !== "ADMIN") {
            navigate("/admin/login");
            return;
        }
        const timer = window.setTimeout(() => {
            loadLists()
                .catch((requestError) => setError(
                    requestError.response?.data?.message || "Unable to load academic structure."))
                .finally(() => setLoading(false));
        }, 0);
        return () => window.clearTimeout(timer);
    }, [loadLists, navigate]);

    const createCohort = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await api.post("/api/admin/cohorts", { name: cohortName, programId: Number(programId) });
            setCohortName("");
            setMessage("Academic cohort created.");
            await loadLists();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to create cohort.");
        } finally {
            setSaving(false);
        }
    };

    const createSection = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await api.post("/api/admin/sections", {
                name: sectionName,
                cohortId: Number(cohortId),
                semesterId: Number(semesterId)
            });
            setSectionName("");
            setMessage("Section created.");
            await loadLists();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to create section.");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (path, label) => {
        if (!window.confirm(`Delete ${label}? Existing student history prevents deletion.`)) return;
        setError("");
        try {
            await api.delete(path);
            await loadLists();
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Unable to delete ${label}.`);
        }
    };

    const renameSection = async (section) => {
        const name = window.prompt("New section name", section.name);
        if (name === null || !name.trim() || name.trim() === section.name) return;
        setError("");
        setMessage("");
        try {
            await api.put(`/api/admin/sections/${section.id}`, { name: name.trim() });
            setMessage("Section renamed.");
            await loadLists();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to rename section.");
        }
    };

    const selectedProgram = programs.find((item) => String(item.id) === programId);
    const matchingCohorts = cohorts.filter((item) => String(item.programId) === programId);
    const matchingSemesters = semesters.filter((item) =>
        String(item.programId ?? item.program?.id) === programId);
    const matchingSections = sections.filter((item) =>
        (!programId || String(item.programId) === programId)
        && (!cohortId || String(item.cohortId) === cohortId)
        && (!semesterId || String(item.semesterId) === semesterId));

    return (
        <AdminLayout>
            <div className="page-container">
                <header className="page-header">
                    <div><h1>Academic Cohorts &amp; Sections</h1><p>Program → Cohort / Batch → Semester → Section</p></div>
                </header>
                {error && <div role="alert" className="error-message">{error}</div>}
                {message && <div role="status" className="form-message">{message}</div>}
                {loading ? <div className="loading" role="status">Loading academic structure...</div> : (
                    <>
                        <section className="form-card">
                            <h2>Create academic cohort / batch</h2>
                            <form onSubmit={createCohort} className="form-grid">
                                <label className="form-group">Program
                                    <select value={programId} onChange={(event) => {
                                        setProgramId(event.target.value);
                                        setCohortId("");
                                    }} required>
                                        <option value="">Select program</option>
                                        {programs.map((program) => <option key={program.id} value={program.id}>
                                            {program.name} · {program.department?.name || ""}
                                        </option>)}
                                    </select>
                                </label>
                                <label className="form-group">Cohort name
                                    <input value={cohortName} onChange={(event) => setCohortName(event.target.value)}
                                        placeholder="e.g. 2025-2029" maxLength="80" required />
                                </label>
                                <button className="primary-button" disabled={saving || !programId}>Create cohort</button>
                            </form>
                        </section>

                        <section className="table-card">
                            <h2>Cohorts {selectedProgram ? `for ${selectedProgram.name}` : ""}</h2>
                            <table className="data-table"><thead><tr>
                                <th>Import ID</th><th>Cohort / Batch</th><th>Program</th><th>Department</th><th>Actions</th>
                            </tr></thead><tbody>
                                {(programId ? matchingCohorts : cohorts).map((cohort) => (
                                    <tr key={cohort.id}><td>{cohort.id}</td><td>{cohort.name}</td><td>{cohort.programName}</td>
                                        <td>{cohort.departmentName}</td><td>
                                            <button className="delete-button" onClick={() =>
                                                remove(`/api/admin/cohorts/${cohort.id}`, `cohort ${cohort.name}`)}>
                                                Delete
                                            </button>
                                        </td></tr>
                                ))}
                                {cohorts.length === 0 && <tr><td colSpan="5" className="empty-state">No cohorts created.</td></tr>}
                            </tbody></table>
                        </section>

                        <section className="form-card">
                            <h2>Create section for a semester</h2>
                            <form onSubmit={createSection} className="form-grid">
                                <label className="form-group">Program
                                    <select value={programId} onChange={(event) => {
                                        setProgramId(event.target.value);
                                        setCohortId("");
                                        setSemesterId("");
                                    }} required>
                                        <option value="">Select program</option>
                                        {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                                    </select>
                                </label>
                                <label className="form-group">Cohort
                                    <select value={cohortId} onChange={(event) => setCohortId(event.target.value)} required disabled={!programId}>
                                        <option value="">Select cohort</option>
                                        {matchingCohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}
                                    </select>
                                </label>
                                <label className="form-group">Semester
                                    <select value={semesterId} onChange={(event) => setSemesterId(event.target.value)} required disabled={!programId}>
                                        <option value="">Select semester</option>
                                        {matchingSemesters.map((semester) => <option key={semester.id} value={semester.id}>
                                            Semester {semester.semesterNumber} · {semester.academicYear?.name || semester.academicYearName || ""}
                                        </option>)}
                                    </select>
                                </label>
                                <label className="form-group">Section name
                                    <input value={sectionName} onChange={(event) => setSectionName(event.target.value)}
                                        placeholder="e.g. A" maxLength="40" required />
                                </label>
                                <button className="primary-button" disabled={saving || !cohortId || !semesterId}>Create section</button>
                            </form>
                        </section>

                        <section className="table-card">
                            <h2>Sections</h2>
                            <div className="filter-grid">
                                <label className="filter-group">Filter by cohort
                                    <select value={cohortId} onChange={(event) => setCohortId(event.target.value)}>
                                        <option value="">All cohorts</option>
                                        {(programId ? matchingCohorts : cohorts).map((cohort) =>
                                            <option key={cohort.id} value={cohort.id}>{cohort.name}</option>)}
                                    </select>
                                </label>
                                <label className="filter-group">Filter by semester
                                    <select value={semesterId} onChange={(event) => setSemesterId(event.target.value)}>
                                        <option value="">All semesters</option>
                                        {(programId ? matchingSemesters : semesters).map((semester) =>
                                            <option key={semester.id} value={semester.id}>
                                                Semester {semester.semesterNumber} · {semester.academicYear?.name || semester.academicYearName || ""}
                                            </option>)}
                                    </select>
                                </label>
                            </div>
                            <table className="data-table"><thead><tr>
                                <th>Import ID</th><th>Section</th><th>Program / Department</th><th>Cohort</th>
                                <th>Semester</th><th>Active Incharge</th><th>Actions</th>
                            </tr></thead><tbody>
                                {matchingSections.map((section) => (
                                    <tr key={section.id}><td>{section.id}</td><td>{section.name}</td>
                                        <td>{section.programName} · {section.departmentName}</td>
                                        <td>{section.cohortName}</td>
                                        <td>Semester {section.semesterNumber} · {section.academicYear}</td>
                                        <td>{section.activeInchargeName || "Not assigned"}</td>
                                        <td>
                                            <button className="secondary-button" onClick={() => renameSection(section)}>
                                                Rename
                                            </button>
                                            <button className="delete-button" onClick={() =>
                                                remove(`/api/admin/sections/${section.id}`, `section ${section.name}`)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {matchingSections.length === 0 && <tr><td colSpan="7" className="empty-state">No matching sections.</td></tr>}
                            </tbody></table>
                        </section>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminAcademicStructure;
