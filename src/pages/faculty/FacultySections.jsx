import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FacultyLayout from "../../components/faculty/FacultyLayout";

function FacultySections() {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [selected, setSelected] = useState(null);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (localStorage.getItem("edumind_role") !== "FACULTY") {
            navigate("/faculty/login");
            return;
        }
        api.get("/api/faculty/me/sections")
            .then((response) => setSections(response.data))
            .catch((requestError) => setError(
                requestError.response?.data?.message || "Unable to load your assigned sections."))
            .finally(() => setLoading(false));
    }, [navigate]);

    useEffect(() => {
        if (!selected) return undefined;
        let cancelled = false;
        const timer = window.setTimeout(() => {
            setLoading(true);
            api.get(`/api/faculty/me/sections/${selected.sectionId}/students`, {
                params: { search, page, size: 25 }
            }).then((response) => {
                if (!cancelled) {
                    setStudents(response.data.content);
                    setTotalPages(response.data.totalPages);
                }
            }).catch((requestError) => {
                if (!cancelled) setError(
                    requestError.response?.data?.message || "Unable to load this roster.");
            }).finally(() => {
                if (!cancelled) setLoading(false);
            });
        }, 200);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [selected, search, page]);

    return (
        <FacultyLayout>
            <div className="page-container">
                <header className="page-header"><div>
                    <h1>My Class / My Sections</h1>
                    <p>Class-incharge rosters are separate from your teaching courses.</p>
                </div></header>
                {error && <div className="error-message" role="alert">{error}</div>}
                {loading && !selected && <div className="loading" role="status">Loading your sections...</div>}
                {!loading && sections.length === 0 && !error && (
                    <div className="faculty-empty-state">You have no active class-incharge assignments. Your teaching courses remain available in My Courses.</div>
                )}
                <div className="faculty-course-grid">
                    {sections.map((section) => <button
                        type="button"
                        className="faculty-course-card"
                        key={section.sectionId}
                        onClick={() => {
                            setSelected(section);
                            setSearch("");
                            setPage(0);
                            setError("");
                        }}
                    >
                        <h3>{section.programName} · {section.cohortName} · {section.sectionName}</h3>
                        <p>{section.departmentName} · Semester {section.semesterNumber}</p>
                        <span className="faculty-course-year">Academic year {section.academicYear}</span>
                    </button>)}
                </div>
                {selected && <section className="table-card">
                    <div className="page-header">
                        <div><h2>{selected.sectionName} · Student roster</h2>
                            <p>{selected.programName} / {selected.departmentName} / {selected.cohortName} / Semester {selected.semesterNumber}</p>
                        </div>
                        <button className="secondary-button" onClick={() => setSelected(null)}>Back to my sections</button>
                    </div>
                    <label className="search-box">Search assigned roster
                        <input value={search} onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(0);
                        }} placeholder="Name, roll number, username or email" />
                    </label>
                    {loading ? <div className="loading" role="status">Loading roster...</div> : (
                        <table className="data-table"><thead><tr>
                            <th>Roll number</th><th>Name</th><th>Email</th><th>Username</th>
                            <th>Program</th><th>Department</th><th>Batch</th><th>Semester</th><th>Section</th>
                        </tr></thead><tbody>
                            {students.map((student) => <tr key={student.id}>
                                <td>{student.rollNumber}</td><td>{student.fullName}</td><td>{student.email || "—"}</td>
                                <td>{student.username}</td><td>{student.programName}</td><td>{student.departmentName}</td>
                                <td>{student.cohortName || "—"}</td><td>Semester {student.semesterNumber}</td><td>{student.sectionName}</td>
                            </tr>)}
                            {students.length === 0 && <tr><td colSpan="9" className="empty-state">No students found in this assigned section.</td></tr>}
                        </tbody></table>
                    )}
                    <div className="pagination-controls">
                        <button className="secondary-button" disabled={page <= 0} onClick={() => setPage((value) => value - 1)}>Previous</button>
                        <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
                        <button className="secondary-button" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
                    </div>
                </section>}
            </div>
        </FacultyLayout>
    );
}

export default FacultySections;
