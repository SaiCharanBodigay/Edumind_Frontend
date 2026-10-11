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
    const [cohorts, setCohorts] = useState([]);
    const [sections, setSections] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

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
    const [filterCohort, setFilterCohort] = useState("");
    const [filterSection, setFilterSection] = useState("");
    const [page, setPage] = useState(0);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        email: "",
        rollNumber: "",
        departmentId: "",
        programId: "",
        semesterId: "",
        cohortId: "",
        sectionId: ""
    });

    const fetchStudents = useCallback(async () => {
        const response = await api.get("/api/admin/students/search", {
            params: {
                search: searchTerm || undefined,
                departmentId: filterDepartment || undefined,
                programId: filterProgram || undefined,
                cohortId: filterCohort || undefined,
                semesterId: filterSemester || undefined,
                sectionId: filterSection || undefined,
                page,
                size: 25
            }
        });
        return response.data;
    }, [searchTerm, filterDepartment, filterProgram, filterCohort, filterSemester, filterSection, page]);

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

    const fetchCohorts = useCallback(async () => {
        const response = await api.get("/api/admin/cohorts");
        return response.data;
    }, []);

    const fetchSections = useCallback(async () => {
        const response = await api.get("/api/admin/sections");
        return response.data;
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const result = await fetchStudents();
            setStudents(result.content);
            setTotalStudents(result.totalElements);
            setTotalPages(result.totalPages);
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
                    departmentsData,
                    programsData,
                    semestersData,
                    cohortsData,
                    sectionsData
                ] = await Promise.all([
                    fetchDepartments(),
                    fetchPrograms(),
                    fetchSemesters(),
                    fetchCohorts(),
                    fetchSections()
                ]);

                if (!cancelled) {
                    setDepartments(departmentsData);
                    setPrograms(programsData);
                    setSemesters(semestersData);
                    setCohorts(cohortsData);
                    setSections(sectionsData);
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
        fetchDepartments,
        fetchPrograms,
        fetchSemesters,
        fetchCohorts,
        fetchSections
    ]);

    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                const result = await fetchStudents();
                if (!cancelled) {
                    setStudents(result.content);
                    setTotalStudents(result.totalElements);
                    setTotalPages(result.totalPages);
                    setError("");
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || "Unable to search students.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, searchTerm ? 250 : 0);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [fetchStudents, searchTerm]);

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            fullName: "",
            email: "",
            rollNumber: "",
            departmentId: "",
            programId: "",
            semesterId: "",
            cohortId: "",
            sectionId: ""
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
                semesterId: "",
                cohortId: "",
                sectionId: ""
            }));

            return;
        }

        if (name === "programId") {
            setFormData((previous) => ({
                ...previous,
                programId: value,
                semesterId: "",
                cohortId: "",
                sectionId: ""
            }));

            return;
        }

        if (name === "semesterId" || name === "cohortId") {
            setFormData((previous) => ({
                ...previous,
                [name]: value,
                sectionId: ""
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
                : "",
            cohortId: student.cohortId ? String(student.cohortId) : "",
            sectionId: student.sectionId ? String(student.sectionId) : ""
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
                        semesterId: Number(formData.semesterId),
                        cohortId: Number(formData.cohortId),
                        sectionId: Number(formData.sectionId)
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
                        semesterId: Number(formData.semesterId),
                        cohortId: Number(formData.cohortId),
                        sectionId: Number(formData.sectionId)
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

    const formCohorts = cohorts.filter((cohort) =>
        !formData.programId || String(cohort.programId) === String(formData.programId));
    const formSections = sections.filter((section) =>
        String(section.cohortId) === String(formData.cohortId)
        && String(section.semesterId) === String(formData.semesterId));

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
                student.username?.toLowerCase().includes(search) ||
                student.email?.toLowerCase().includes(search);

            const matchesDepartment =
                filterDepartment === "" ||
                String(student.departmentId) === filterDepartment;

            const matchesProgram =
                filterProgram === "" ||
                String(student.programId) === filterProgram;

            const matchesSemester =
                filterSemester === "" ||
                String(student.semesterId) === filterSemester;
            const matchesCohort =
                filterCohort === "" ||
                String(student.cohortId) === filterCohort;
            const matchesSection =
                filterSection === "" ||
                String(student.sectionId) === filterSection;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesProgram &&
                matchesSemester &&
                matchesCohort &&
                matchesSection
            );
        });
    }, [
        students,
        searchTerm,
        filterDepartment,
        filterProgram,
        filterSemester,
        filterCohort,
        filterSection
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

    const filterCohorts = cohorts.filter((cohort) =>
        (!filterProgram || String(cohort.programId) === filterProgram)
        && (!filterDepartment || String(cohort.departmentId) === filterDepartment));
    const filterSections = sections.filter((section) =>
        (!filterCohort || String(section.cohortId) === filterCohort)
        && (!filterSemester || String(section.semesterId) === filterSemester));
    const pageCount = Math.max(1, totalPages);
    const currentPage = Math.min(page, pageCount - 1);
    const visibleStudents = filteredStudents;

    const clearFilters = () => {
        setSearchTerm("");
        setFilterDepartment("");
        setFilterProgram("");
        setFilterSemester("");
        setFilterCohort("");
        setFilterSection("");
        setPage(0);
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

                                <div className="form-group">
                                    <label>Academic Cohort / Batch</label>
                                    <select
                                        name="cohortId"
                                        value={formData.cohortId}
                                        onChange={handleChange}
                                        disabled={!formData.programId}
                                        required
                                    >
                                        <option value="">
                                            {!formData.programId
                                                ? "Select Program First"
                                                : "Select Cohort"}
                                        </option>
                                        {formCohorts.map((cohort) => (
                                            <option key={cohort.id} value={cohort.id}>
                                                {cohort.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Section</label>
                                    <select
                                        name="sectionId"
                                        value={formData.sectionId}
                                        onChange={handleChange}
                                        disabled={!formData.cohortId || !formData.semesterId}
                                        required
                                    >
                                        <option value="">Select Section</option>
                                        {formSections.map((section) => (
                                            <option key={section.id} value={section.id}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.cohortId && formData.semesterId && formSections.length === 0
                                        && <small>Create the section before assigning this student.</small>}
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
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setPage(0);
                            }}
                            placeholder="Search by name, roll number, username or email..."
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
                                    setFilterCohort("");
                                    setFilterSection("");
                                    setPage(0);
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
                            <label>Academic Cohort / Batch</label>
                            <select
                                value={filterCohort}
                                onChange={(event) => {
                                    setFilterCohort(event.target.value);
                                    setFilterSection("");
                                    setPage(0);
                                }}
                            >
                                <option value="">All cohorts</option>
                                {filterCohorts.map((cohort) => (
                                    <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Section</label>
                            <select
                                value={filterSection}
                                onChange={(event) => {
                                    setFilterSection(event.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">All sections</option>
                                {filterSections.map((section) => (
                                    <option key={section.id} value={section.id}>{section.name}</option>
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
                                    const selectedProgram = programs.find(
                                        (program) => String(program.id) === event.target.value);
                                    setFilterDepartment(
                                        selectedProgram
                                            ? String(selectedProgram.departmentId ?? selectedProgram.department?.id ?? "")
                                            : "");
                                    setFilterSemester("");
                                    setFilterCohort("");
                                    setFilterSection("");
                                    setPage(0);
                                }}
                            >
                                <option value="">
                                    All Programs
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
                                    (() => {
                                        setFilterSemester(event.target.value);
                                        setFilterSection("");
                                        setPage(0);
                                    })()
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
                                        Semester {semester.semesterNumber}
                                        {" · "}
                                        {semester.academicYear?.name || semester.academicYearName || ""}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div className="filter-button-container">

                            <button
                                className="secondary-button"
                                onClick={clearFilters}
                                type="button"
                            >
                                Clear Filters
                            </button>

                        </div>

                    </div>

                    <div className="result-count">
                        {[
                            programs.find((item) => String(item.id) === filterProgram)?.name,
                            departments.find((item) => String(item.id) === filterDepartment)?.name,
                            cohorts.find((item) => String(item.id) === filterCohort)?.name,
                            semesters.find((item) => String(item.id) === filterSemester)
                                ? `Semester ${semesters.find((item) => String(item.id) === filterSemester).semesterNumber}`
                                : null,
                            sections.find((item) => String(item.id) === filterSection)?.name
                        ].filter(Boolean).join(" → ") || "Institution-wide student search"}
                        {" · Showing "}<strong>{filteredStudents.length}</strong>
                        {" on this page of "}<strong>{totalStudents}</strong>{" students"}
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
                                    <th>Batch</th>
                                    <th>Semester</th>
                                    <th>Section</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="11"
                                            className="empty-state"
                                        >
                                            No students match the current search or filters.
                                        </td>
                                    </tr>
                                ) : (
                                    visibleStudents.map(
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

                                                <td>{student.cohortName || "Unassigned"}</td>

                                                <td>
                                                    {student.semesterNumber
                                                        ? `Semester ${student.semesterNumber} · ${student.academicYear}`
                                                        : "Not assigned"}
                                                </td>

                                                <td>{student.sectionName || "Unassigned"}</td>

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

                        <div className="pagination-controls" aria-label="Student pages">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={currentPage === 0}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage + 1} of {pageCount}</span>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                                disabled={currentPage >= pageCount - 1}
                            >
                                Next
                            </button>
                        </div>

                    </div>
                )}

            </div>

        </AdminLayout>
    );
}

export default AdminStudents;
