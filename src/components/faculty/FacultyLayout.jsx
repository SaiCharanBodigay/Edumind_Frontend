import FacultySidebar from "./FacultySidebar";

function FacultyLayout({ children }) {
    return (
        <div className="admin-layout faculty-layout">
            <FacultySidebar />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}

export default FacultyLayout;
