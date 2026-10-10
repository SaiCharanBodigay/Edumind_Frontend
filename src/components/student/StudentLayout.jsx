import StudentSidebar from "./StudentSidebar";

function StudentLayout({ children }) {
    return (
        <div className="admin-layout student-layout">
            <StudentSidebar />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}

export default StudentLayout;
