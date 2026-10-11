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
import AdminAcademicStructure from "./pages/admin/AdminAcademicStructure";
import AdminClassIncharges from "./pages/admin/AdminClassIncharges";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyCourses from "./pages/faculty/FacultyCourses";
import FacultyLearningMaterials from "./pages/faculty/FacultyLearningMaterials";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseMaterials from "./pages/student/StudentCourseMaterials";
import StudentProfile from "./pages/student/StudentProfile";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultySections from "./pages/faculty/FacultySections";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentAssignmentDetail from "./pages/student/StudentAssignmentDetail";
import FacultyQuizzes from "./pages/faculty/FacultyQuizzes";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentQuizDetail from "./pages/student/StudentQuizDetail";
import StudentQuizAttempt from "./pages/student/StudentQuizAttempt";
import StudentQuizResult from "./pages/student/StudentQuizResult";
import "./styles/quizzes.css";

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
                    path="/admin/academic-structure"
                    element={<AdminAcademicStructure />}
                />

                <Route
                    path="/admin/class-incharges"
                    element={<AdminClassIncharges />}
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
                    path="/faculty/quizzes"
                    element={<FacultyQuizzes />}
                />

                <Route
                    path="/faculty/sections"
                    element={<FacultySections />}
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

                <Route
                    path="/student/quizzes"
                    element={<StudentRouteGuard><StudentQuizzes /></StudentRouteGuard>}
                />

                <Route
                    path="/student/quizzes/:quizId"
                    element={<StudentRouteGuard><StudentQuizDetail /></StudentRouteGuard>}
                />

                <Route
                    path="/student/quizzes/:quizId/attempt/:attemptId"
                    element={<StudentRouteGuard><StudentQuizAttempt /></StudentRouteGuard>}
                />

                <Route
                    path="/student/quizzes/:quizId/results/:attemptId"
                    element={<StudentRouteGuard><StudentQuizResult /></StudentRouteGuard>}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
