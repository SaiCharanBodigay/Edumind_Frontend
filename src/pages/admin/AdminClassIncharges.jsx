import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminClassIncharges() {
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState([]);
    const [sections, setSections] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [facultyId, setFacultyId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        const [facultyResponse, sectionsResponse, assignmentsResponse] = await Promise.all([
            api.get("/api/admin/faculty"),
            api.get("/api/admin/sections"),
            api.get("/api/admin/class-incharges")
        ]);
        setFaculty(facultyResponse.data);
        setSections(sectionsResponse.data);
        setAssignments(assignmentsResponse.data);
    }, []);

    useEffect(() => {
        if (localStorage.getItem("edumind_role") !== "ADMIN") {
            navigate("/admin/login");
            return;
        }
        const timer = window.setTimeout(() => {
            load().catch((requestError) => setError(
                requestError.response?.data?.message || "Unable to load class-incharge data."));
        }, 0);
        return () => window.clearTimeout(timer);
    }, [load, navigate]);

    const assign = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await api.post("/api/admin/class-incharges", {
                facultyId: Number(facultyId),
                sectionId: Number(sectionId),
                startDate: startDate || null
            });
            setFacultyId("");
            setSectionId("");
            setStartDate("");
            await load();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to assign class incharge.");
        } finally {
            setSaving(false);
        }
    };

    const end = async (assignment) => {
        if (!window.confirm(`End ${assignment.facultyName}'s assignment for Section ${assignment.sectionName}?`)) return;
        setError("");
        try {
            await api.delete(`/api/admin/class-incharges/${assignment.id}`);
            await load();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to end assignment.");
        }
    };

    return (
        <AdminLayout>
            <div className="page-container">
                <header className="page-header"><div>
                    <h1>Class-Incharge Assignments</h1>
                    <p>Each section has one active primary incharge. Course allocations remain separate.</p>
                </div></header>
                {error && <div className="error-message" role="alert">{error}</div>}
                <section className="form-card">
                    <h2>Assign or reassign a class incharge</h2>
                    <form className="form-grid" onSubmit={assign}>
                        <label className="form-group">Faculty
                            <select value={facultyId} onChange={(event) => setFacultyId(event.target.value)} required>
                                <option value="">Choose faculty</option>
                                {faculty.map((member) => <option key={member.id} value={member.id}>
                                    {member.fullName} · {member.employeeId}
                                </option>)}
                            </select>
                        </label>
                        <label className="form-group">Section
                            <select value={sectionId} onChange={(event) => setSectionId(event.target.value)} required>
                                <option value="">Choose section</option>
                                {sections.map((section) => <option key={section.id} value={section.id}>
                                    {section.programName} · {section.cohortName} · Semester {section.semesterNumber} · {section.name}
                                    {section.activeInchargeName ? ` (current: ${section.activeInchargeName})` : ""}
                                </option>)}
                            </select>
                        </label>
                        <label className="form-group">Start date (defaults to today)
                            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                        </label>
                        <button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Assign incharge"}</button>
                    </form>
                </section>
                <section className="table-card"><h2>Active assignments</h2>
                    <table className="data-table"><thead><tr>
                        <th>Faculty</th><th>Section</th><th>Program / Department</th><th>Batch</th><th>Semester</th><th>Start date</th><th>Actions</th>
                    </tr></thead><tbody>
                        {assignments.map((item) => <tr key={item.id}>
                            <td>{item.facultyName} · {item.employeeId}</td>
                            <td>{item.sectionName}</td>
                            <td>{item.programName} · {item.departmentName}</td>
                            <td>{item.cohortName}</td>
                            <td>Semester {item.semesterNumber} · {item.academicYear}</td>
                            <td>{item.startDate}</td>
                            <td><button className="delete-button" onClick={() => end(item)}>End assignment</button></td>
                        </tr>)}
                        {assignments.length === 0 && <tr><td colSpan="7" className="empty-state">No active class-incharge assignments.</td></tr>}
                    </tbody></table>
                </section>
            </div>
        </AdminLayout>
    );
}

export default AdminClassIncharges;
