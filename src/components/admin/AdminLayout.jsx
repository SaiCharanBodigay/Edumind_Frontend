import { AppShell } from "../common/AppShell";

const ADMIN_NAV = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/students", label: "Students", icon: "students" },
    { to: "/admin/faculty", label: "Faculty", icon: "faculty" },
    { to: "/admin/departments", label: "Departments", icon: "department" },
    { to: "/admin/programs", label: "Programs", icon: "program" },
    { to: "/admin/academic-years", label: "Academic Years", icon: "academic-year" },
    { to: "/admin/semesters", label: "Semesters", icon: "semester" },
    { to: "/admin/academic-structure", label: "Cohorts & Sections", icon: "structure" },
    { to: "/admin/class-incharges", label: "Class Incharges", icon: "class-incharge" },
    { to: "/admin/courses", label: "Courses", icon: "courses" },
    { to: "/admin/faculty-allocation", label: "Faculty Allocation", icon: "allocation" },
    { to: "/admin/bulk-import", label: "Bulk Import", icon: "import" },
];

function AdminLayout({ children }) {
    return (
        <AppShell
            role="ADMIN"
            portalName="Admin Portal"
            navItems={ADMIN_NAV}
        >
            {children}
        </AppShell>
    );
}

export default AdminLayout;
