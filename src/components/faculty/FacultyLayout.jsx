import { AppShell } from "../common/AppShell";

const FACULTY_NAV = [
    { to: "/faculty/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/faculty/courses", label: "My Courses", icon: "courses" },
    { to: "/faculty/learning-materials", label: "Learning Materials", icon: "materials" },
    { to: "/faculty/assignments", label: "Assignments", icon: "assignments" },
    { to: "/faculty/quizzes", label: "Quizzes", icon: "quizzes" },
    { to: "/faculty/sections", label: "My Class / Sections", icon: "sections" },
];

function FacultyLayout({ children }) {
    return (
        <AppShell
            role="FACULTY"
            portalName="Faculty Portal"
            navItems={FACULTY_NAV}
        >
            {children}
        </AppShell>
    );
}

export default FacultyLayout;
