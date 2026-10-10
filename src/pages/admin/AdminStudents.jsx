import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminStudents() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [formMessage, setFormMessage] = useState("");

    // Search and filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterProgram, setFilterProgram] = useState("");
    const [filterSemester, setFilterSemester] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        email: "",
        rollNumber: "",
        departmentId: "",
        programId: "",
        semesterId: ""
    });

    const fetchStudents = useCallback(async () => {
        const response = await api.get("/api/admin/students");
        return response.data;
    }, []);

    const fetchDepartments = useCallback(async () => {
        const response = await api.get("/api/admin/departments");
        return response.data;
    }, []);

    const fetchPrograms = useCallback(async () => {
        const response = await api.get("/api/admin/programs");
        return response.data;
    }, []);

    const fetchSemesters = useCallback(async () => {
        const response = await api.get("/api/admin/semesters");
        return response.data;
    }, []);

    const loadStudents = async () => {
        try {
            setStudents(await fetchStudents());
            setError("");
        } catch (error) {
            console.error("Students error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem("edumind_role");

        if (role !== "ADMIN") {
            navigate("/admin/login");
            return;
        }

        let cancelled = false;

        const loadInitialData = async () => {
            try {
                const [
                    studentsData,
                    departmentsData,
                    programsData,
                    semestersData
                ] = await Promise.all([
                    fetchStudents(),
                    fetchDepartments(),
                    fetchPrograms(),
                    fetchSemesters()
                ]);

                if (!cancelled) {
                    setStudents(studentsData);
                    setDepartments(departmentsData);
                    setPrograms(programsData);
                    setSemesters(semestersData);
                }
            } catch (error) {
                console.error("Student page load error:", error);

                if (!cancelled) {
                    setError(
                        error.response?.data?.message ||
                        "Unable to load student management data."
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
    }, [
        navigate,
        fetchStudents,
        fetchDepartments,
        fetchPrograms,
        fetchSemesters
    ]);

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            fullName: "",
            email: "",
            rollNumber: "",
            departmentId: "",
            programId: "",
            semesterId: ""
        });

        setEditingStudent(null);
        setFormMessage("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "departmentId") {
            setFormData((previous) => ({
                ...previous,
                departmentId: value,
                programId: "",
                semesterId: ""
            }));

            return;
        }

        if (name === "programId") {
            setFormData((previous) => ({
                ...previous,
                programId: value,
                semesterId: ""
            }));

            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (student) => {
        setEditingStudent(student);
        setShowForm(true);
        setFormMessage("");

        setFormData({
            username: student.username || "",
            password: "",
            fullName: student.fullName || "",
            email: student.email || "",
            rollNumber: student.rollNumber || "",
            departmentId: student.departmentId
                ? String(student.departmentId)
                : "",
            programId: student.programId
                ? String(student.programId)
                : "",
            semesterId: student.semesterId
                ? String(student.semesterId)
                : ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const closeForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setFormMessage("");

            if (editingStudent) {
                await api.put(
                    `/api/admin/students/${editingStudent.id}`,
                    {
                        fullName: formData.fullName,
                        email: formData.email,
                        rollNumber: formData.rollNumber,
                        departmentId: Number(formData.departmentId),
                        programId: Number(formData.programId),
                        semesterId: Number(formData.semesterId)
                    }
                );

                setFormMessage("Student updated successfully.");
            } else {
                await api.post(
                    "/api/admin/students",
                    {
                        username: formData.username,
                        password: formData.password,
                        fullName: formData.fullName,
                        email: formData.email,
                        rollNumber: formData.rollNumber,
                        departmentId: Number(formData.departmentId),
                        programId: Number(formData.programId),
                        semesterId: Number(formData.semesterId)
                    }
                );

                setFormMessage("Student created successfully.");
            }

            await loadStudents();

            setTimeout(() => {
                closeForm();
            }, 700);

        } catch (error) {
            console.error("Save student error:", error);

            setFormMessage(
                error.response?.data?.message ||
                "Unable to save student."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (student) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${student.fullName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(student.id);
            setError("");

            await api.delete(
                `/api/admin/students/${student.id}`
            );

            await loadStudents();

        } catch (error) {
            console.error("Delete student error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to delete student."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const selectedDepartmentId = String(formData.departmentId);
    const selectedProgramId = String(formData.programId);

    const filteredPrograms = programs.filter((program) => {
        const programDepartmentId =
            program.departmentId ??
            program.department?.id;

        return String(programDepartmentId) === selectedDepartmentId;
    });

    const filteredSemesters = semesters.filter((semester) => {
        const semesterProgramId =
            semester.programId ??
            semester.program?.id;

        return String(semesterProgramId) === selectedProgramId;
    });

    // =========================
    // SEARCH + FILTERING
    // =========================

    const filteredStudents = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return students.filter((student) => {

            const matchesSearch =
                search === "" ||
                student.fullName?.toLowerCase().includes(search) ||
                student.rollNumber?.toLowerCase().includes(search) ||
                student.username?.toLowerCase().includes(search);

            const matchesDepartment =
                filterDepartment === "" ||
                String(student.departmentId) === filterDepartment;

            const matchesProgram =
                filterProgram === "" ||
                String(student.programId) === filterProgram;

            const matchesSemester =
                filterSemester === "" ||
                String(student.semesterId) === filterSemester;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesProgram &&
                matchesSemester
            );
        });
    }, [
        students,
        searchTerm,
        filterDepartment,
        filterProgram,
        filterSemester
    ]);

    const filterPrograms = programs.filter((program) => {
        if (!filterDepartment) {
            return true;
        }

        const departmentId =
            program.departmentId ??
            program.department?.id;

        return String(departmentId) === filterDepartment;
    });

    const filterSemesters = semesters.filter((semester) => {
        if (!filterProgram) {
            return true;
        }

        const programId =
            semester.programId ??
            semester.program?.id;

        return String(programId) === filterProgram;
    });

    const clearFilters = () => {
        setSearchTerm("");
        setFilterDepartment("");
        setFilterProgram("");
        setFilterSemester("");
    };

    return (
        <AdminLayout>

            <div className="page-container">

                <div className="page-header">

                    <div>
                        <h1>Students</h1>
                        <p>Manage all students in EduMind</p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={
                            showForm
                                ? closeForm
                                : openAddForm
                        }
                    >
                        {showForm
                            ? "Close Form"
                            : "+ Add Student"}
                    </button>

                </div>

                {showForm && (
                    <div className="form-card">

                        <h2>
                            {editingStudent
                                ? "Edit Student"
                                : "Add New Student"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>Username</label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        disabled={Boolean(editingStudent)}
                                        required
                                    />
                                </div>

                                {!editingStudent && (
                                    <div className="form-group">
                                        <label>Password</label>

                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Roll Number</label>

                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                        placeholder="Enter roll number"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Department</label>

                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map(
                                            (department) => (
                                                <option
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Program</label>

                                    <select
                                        name="programId"
                                        value={formData.programId}
                                        onChange={handleChange}
                                        disabled={
                                            !formData.departmentId
                                        }
                                        required
                                    >
                                        <option value="">
                                            {!formData.departmentId
                                                ? "Select Department First"
                                                : filteredPrograms.length === 0
                                                    ? "No Programs Available"
                                                    : "Select Program"}
                                        </option>

                                        {filteredPrograms.map(
                                            (program) => (
                                                <option
                                                    key={program.id}
                                                    value={program.id}
                                                >
                                                    {program.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Semester</label>

                                    <select
                                        name="semesterId"
                                        value={formData.semesterId}
                                        onChange={handleChange}
                                        disabled={
                                            !formData.programId
                                        }
                                        required
                                    >
                                        <option value="">
                                            {!formData.programId
                                                ? "Select Program First"
                                                : filteredSemesters.length === 0
                                                    ? "No Semesters Available"
                                                    : "Select Semester"}
                                        </option>

                                        {filteredSemesters.map(
                                            (semester) => (
                                                <option
                                                    key={semester.id}
                                                    value={semester.id}
                                                >
                                                    Semester{" "}
                                                    {semester.semesterNumber}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                            </div>

                            {formMessage && (
                                <div className="form-message">
                                    {formMessage}
                                </div>
                            )}

                            <div className="form-actions">

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingStudent
                                            ? "Update Student"
                                            : "Create Student"}
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>
                )}

                {/* SEARCH + FILTERS */}

                <div className="filter-card">

                    <div className="search-box">

                        <label>Search Students</label>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by name, roll number or username..."
                        />

                    </div>

                    <div className="filter-grid">

                        <div className="filter-group">

                            <label>Department</label>

                            <select
                                value={filterDepartment}
                                onChange={(event) => {
                                    setFilterDepartment(
                                        event.target.value
                                    );

                                    setFilterProgram("");
                                    setFilterSemester("");
                                }}
                            >
                                <option value="">
                                    All Departments
                                </option>

                                {departments.map((department) => (
                                    <option
                                        key={department.id}
                                        value={department.id}
                                    >
                                        {department.name}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="filter-group">

                            <label>Program</label>

                            <select
                                value={filterProgram}
                                onChange={(event) => {
                                    setFilterProgram(
                                        event.target.value
                                    );

                                    setFilterSemester("");
                                }}
                                disabled={!filterDepartment}
                            >
                                <option value="">
                                    {!filterDepartment
                                        ? "Select Department First"
                                        : "All Programs"}
                                </option>

                                {filterPrograms.map((program) => (
                                    <option
                                        key={program.id}
                                        value={program.id}
                                    >
                                        {program.name}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div className="filter-group">

                            <label>Semester</label>

                            <select
                                value={filterSemester}
                                onChange={(event) =>
                                    setFilterSemester(
                                        event.target.value
                                    )
                                }
                                disabled={!filterProgram}
                            >
                                <option value="">
                                    {!filterProgram
                                        ? "Select Program First"
                                        : "All Semesters"}
                                </option>

                                {filterSemesters.map((semester) => (
                                    <option
                                        key={semester.id}
                                        value={semester.id}
                                    >
                                        Semester{" "}
                                        {semester.semesterNumber}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div className="filter-button-container">

                            <button
                                className="secondary-button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    </div>

                    <div className="result-count">
                        Showing{" "}
                        <strong>{filteredStudents.length}</strong>{" "}
                        of{" "}
                        <strong>{students.length}</strong>{" "}
                        students
                    </div>

                </div>

                {loading && (
                    <div className="loading">
                        Loading students...
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="table-card">

                        <table className="data-table">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Roll Number</th>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Program</th>
                                    <th>Semester</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="empty-state"
                                        >
                                            No students match the current search or filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map(
                                        (student) => (
                                            <tr
                                                key={student.id}
                                            >

                                                <td>
                                                    {student.id}
                                                </td>

                                                <td>
                                                    {student.rollNumber}
                                                </td>

                                                <td>
                                                    {student.fullName}
                                                </td>

                                                <td>
                                                    {student.username}
                                                </td>

                                                <td>
                                                    {student.email}
                                                </td>

                                                <td>
                                                    {student.departmentName}
                                                </td>

                                                <td>
                                                    {student.programName}
                                                </td>

                                                <td>
                                                    {student.semesterNumber}
                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    student
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                student.id
                                                            }
                                                        >
                                                            {deletingId ===
                                                            student.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </AdminLayout>
    );
}

export default AdminStudents;
