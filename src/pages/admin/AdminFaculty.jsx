import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminFaculty() {
    const navigate = useNavigate();

    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formMessage, setFormMessage] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [designationFilter, setDesignationFilter] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        email: "",
        employeeId: "",
        designation: "",
        departmentId: ""
    });

    const fetchFaculty = useCallback(async () => {
        const response = await api.get("/api/admin/faculty");
        return response.data;
    }, []);

    const fetchDepartments = useCallback(async () => {
        const response = await api.get("/api/admin/departments");
        return response.data;
    }, []);

    const loadFaculty = async () => {
        try {
            setFaculty(await fetchFaculty());
            setError("");
        } catch (error) {
            console.error("Faculty error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load faculty."
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
                const [facultyData, departmentsData] = await Promise.all([
                    fetchFaculty(),
                    fetchDepartments()
                ]);

                if (!cancelled) {
                    setFaculty(facultyData);
                    setDepartments(departmentsData);
                }
            } catch (error) {
                console.error("Faculty page load error:", error);

                if (!cancelled) {
                    setError(
                        error.response?.data?.message ||
                        "Unable to load faculty or departments."
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
    }, [navigate, fetchFaculty, fetchDepartments]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            fullName: "",
            email: "",
            employeeId: "",
            designation: "",
            departmentId: ""
        });

        setEditingId(null);
        setFormMessage("");
    };

    const openAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEdit = (member) => {
        setEditingId(member.id);

        setFormData({
            username: member.username || "",
            password: "",
            fullName: member.fullName || "",
            email: member.email || "",
            employeeId: member.employeeId || "",
            designation: member.designation || "",
            departmentId: member.departmentId || ""
        });

        setFormMessage("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setFormMessage("");

            if (editingId) {
                await api.put(
                    `/api/admin/faculty/${editingId}`,
                    {
                        fullName: formData.fullName,
                        email: formData.email,
                        employeeId: formData.employeeId,
                        designation: formData.designation,
                        departmentId: Number(formData.departmentId)
                    }
                );

                setFormMessage("Faculty updated successfully.");
            } else {
                await api.post(
                    "/api/admin/faculty",
                    {
                        username: formData.username,
                        password: formData.password,
                        fullName: formData.fullName,
                        email: formData.email,
                        employeeId: formData.employeeId,
                        designation: formData.designation,
                        departmentId: Number(formData.departmentId)
                    }
                );

                setFormMessage("Faculty created successfully.");
            }

            await loadFaculty();

            setTimeout(() => {
                setShowForm(false);
                resetForm();
            }, 700);

        } catch (error) {
            console.error("Faculty save error:", error);

            setFormMessage(
                error.response?.data?.message ||
                "Unable to save faculty."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (member) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${member.fullName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/api/admin/faculty/${member.id}`
            );

            await loadFaculty();

        } catch (error) {
            console.error("Delete faculty error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to delete faculty."
            );
        }
    };

    const designations = useMemo(() => {
        return [
            ...new Set(
                faculty
                    .map((member) => member.designation)
                    .filter(Boolean)
            )
        ].sort();
    }, [faculty]);

    const filteredFaculty = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return faculty.filter((member) => {

            const matchesSearch =
                !search ||
                member.fullName?.toLowerCase().includes(search) ||
                member.employeeId?.toLowerCase().includes(search) ||
                member.username?.toLowerCase().includes(search) ||
                member.email?.toLowerCase().includes(search) ||
                member.departmentName?.toLowerCase().includes(search) ||
                member.designation?.toLowerCase().includes(search);

            const matchesDepartment =
                !departmentFilter ||
                String(member.departmentId) === String(departmentFilter);

            const matchesDesignation =
                !designationFilter ||
                member.designation === designationFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesDesignation
            );
        });
    }, [
        faculty,
        searchTerm,
        departmentFilter,
        designationFilter
    ]);

    const clearFilters = () => {
        setSearchTerm("");
        setDepartmentFilter("");
        setDesignationFilter("");
    };

    return (
        <AdminLayout>

            <div className="page-container">

                <div className="page-header">

                    <div>
                        <h1>Faculty</h1>
                        <p>Manage all faculty members in EduMind</p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => {
                            if (showForm) {
                                setShowForm(false);
                                resetForm();
                            } else {
                                openAddForm();
                            }
                        }}
                    >
                        {showForm
                            ? "Close Form"
                            : "+ Add Faculty"}
                    </button>

                </div>

                {showForm && (
                    <div className="form-card">

                        <h2>
                            {editingId
                                ? "Edit Faculty"
                                : "Add New Faculty"}
                        </h2>

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                {!editingId && (
                                    <>
                                        <div className="form-group">
                                            <label>Username</label>

                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Enter username"
                                                required
                                            />
                                        </div>

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
                                    </>
                                )}

                                {editingId && (
                                    <div className="form-group">
                                        <label>Username</label>

                                        <input
                                            type="text"
                                            value={formData.username}
                                            disabled
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
                                    <label>Employee ID</label>

                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        placeholder="Example: FAC004"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Designation</label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Example: Assistant Professor"
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

                            </div>

                            {formMessage && (
                                <div className="form-message">
                                    {formMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Faculty"
                                        : "Create Faculty"}
                            </button>

                        </form>

                    </div>
                )}

                {!loading && !error && (
                    <div className="filter-card">

                        <div className="search-box">

                            <label>Search Faculty</label>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search by name, employee ID, username, email, department or designation..."
                            />

                        </div>

                        <div className="filter-grid">

                            <div className="filter-group">

                                <label>Department</label>

                                <select
                                    value={departmentFilter}
                                    onChange={(event) =>
                                        setDepartmentFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Departments
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

                            <div className="filter-group">

                                <label>Designation</label>

                                <select
                                    value={designationFilter}
                                    onChange={(event) =>
                                        setDesignationFilter(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Designations
                                    </option>

                                    {designations.map(
                                        (designation) => (
                                            <option
                                                key={designation}
                                                value={designation}
                                            >
                                                {designation}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div></div>

                            <div className="filter-button-container">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>

                            </div>

                        </div>

                        <div className="result-count">
                            Showing{" "}
                            <strong>
                                {filteredFaculty.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {faculty.length}
                            </strong>{" "}
                            faculty members
                        </div>

                    </div>
                )}

                {loading && (
                    <div className="loading">
                        Loading faculty...
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
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Designation</th>
                                    <th>Department</th>
                                    <th>Class Incharge</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredFaculty.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="empty-state"
                                        >
                                            No faculty members match your search or filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFaculty.map((member) => (
                                        <tr key={member.id}>

                                            <td>
                                                {member.id}
                                            </td>

                                            <td>
                                                {member.employeeId}
                                            </td>

                                            <td>
                                                {member.fullName}
                                            </td>

                                            <td>
                                                {member.username}
                                            </td>

                                            <td>
                                                {member.email}
                                            </td>

                                            <td>
                                                {member.designation}
                                            </td>

                                            <td>
                                                {member.departmentName}
                                            </td>

                                            <td>
                                                {member.activeClassInchargeSections?.length
                                                    ? member.activeClassInchargeSections.join(", ")
                                                    : "No active section"}
                                            </td>

                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        type="button"
                                                        className="edit-button"
                                                        onClick={() =>
                                                            handleEdit(member)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(member)
                                                        }
                                                    >
                                                        Delete
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

export default AdminFaculty;
