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
import FacultyLearningMaterials from "./pages/faculty/FacultyLearningMaterials";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseMaterials from "./pages/student/StudentCourseMaterials";
import StudentProfile from "./pages/student/StudentProfile";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentAssignmentDetail from "./pages/student/StudentAssignmentDetail";

function StudentRouteGuard({ children }) {
    const role = localStorage.getItem("edumind_role");
    if (role === "STUDENT" && localStorage.getItem("edumind_token")) {
        return children;
    }
    const redirect = {
        ADMIN: "/admin/dashboard",
        FACULTY: "/faculty/dashboard"
    }[role] || "/student/login";
    return <Navigate to={redirect} replace />;
}

function App() {
    const role = localStorage.getItem("edumind_role");
    const homePath = {
        ADMIN: "/admin/dashboard",
        FACULTY: "/faculty/dashboard",
        STUDENT: "/student/dashboard"
    }[role] || "/admin/login";

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
                    path="/student/login"
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

                <Route
                    path="/faculty/learning-materials"
                    element={<FacultyLearningMaterials />}
                />

                <Route
                    path="/faculty/assignments"
                    element={<FacultyAssignments />}
                />

                <Route
                    path="/student/dashboard"
                    element={
                        <StudentRouteGuard>
                            <StudentDashboard />
                        </StudentRouteGuard>
                    }
                />

                <Route
                    path="/student/courses"
                    element={
                        <StudentRouteGuard>
                            <StudentCourses />
                        </StudentRouteGuard>
                    }
                />

                <Route
                    path="/student/courses/:courseId"
                    element={
                        <StudentRouteGuard>
                            <StudentCourseMaterials />
                        </StudentRouteGuard>
                    }
                />

                <Route
                    path="/student/profile"
                    element={
                        <StudentRouteGuard>
                            <StudentProfile />
                        </StudentRouteGuard>
                    }
                />

                <Route
                    path="/student/assignments"
                    element={
                        <StudentRouteGuard>
                            <StudentAssignments />
                        </StudentRouteGuard>
                    }
                />

                <Route
                    path="/student/assignments/:assignmentId"
                    element={
                        <StudentRouteGuard>
                            <StudentAssignmentDetail />
                        </StudentRouteGuard>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
