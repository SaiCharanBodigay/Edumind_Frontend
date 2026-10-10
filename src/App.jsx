import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminPrograms from "./pages/admin/AdminPrograms";
import AdminAcademicYears from "./pages/admin/AdminAcademicYears";
import AdminSemesters from "./pages/admin/AdminSemesters";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminFacultyAllocation from "./pages/admin/AdminFacultyAllocation";
import AdminBulkImport from "./pages/admin/AdminBulkImport";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyCourses from "./pages/faculty/FacultyCourses";

function App() {
    const role = localStorage.getItem("edumind_role");
    const homePath = role === "ADMIN"
        ? "/admin/dashboard"
        : role === "FACULTY"
            ? "/faculty/dashboard"
            : "/admin/login";

    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to={homePath}
                            replace
                        />
                    }
                />

                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />

                <Route
                    path="/faculty/login"
                    element={<AdminLogin />}
                />

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/students"
                    element={<AdminStudents />}
                />

                <Route
                    path="/admin/faculty"
                    element={<AdminFaculty />}
                />

                <Route
                    path="/admin/departments"
                    element={<AdminDepartments />}
                />

                <Route
                    path="/admin/programs"
                    element={<AdminPrograms />}
                />

                <Route
                    path="/admin/academic-years"
                    element={<AdminAcademicYears />}
                />

                <Route
                    path="/admin/semesters"
                    element={<AdminSemesters />}
                />

                <Route
                    path="/admin/courses"
                    element={<AdminCourses />}
                />

                <Route
                    path="/admin/faculty-allocation"
                    element={<AdminFacultyAllocation />}
                />

                <Route
                    path="/admin/bulk-import"
                    element={<AdminBulkImport />}
                />

                <Route
                    path="/faculty/dashboard"
                    element={<FacultyDashboard />}
                />

                <Route
                    path="/faculty/courses"
                    element={<FacultyCourses />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
