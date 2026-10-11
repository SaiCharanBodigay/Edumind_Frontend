import { AppShell } from "../common/AppShell";

const STUDENT_NAV = [
    { to: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/student/courses", label: "My Courses", icon: "courses" },
    { to: "/student/assignments", label: "Assignments", icon: "assignments" },
    { to: "/student/quizzes", label: "Quizzes", icon: "quizzes" },
    { to: "/student/profile", label: "Profile", icon: "profile" },
];

function StudentLayout({ children }) {
    return (
        <AppShell
            role="STUDENT"
            portalName="Student Portal"
            navItems={STUDENT_NAV}
        >
            {children}
        </AppShell>
    );
}

export default StudentLayout;
