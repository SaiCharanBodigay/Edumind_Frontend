import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentLayout from "../../components/student/StudentLayout";

function StudentProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get("/api/student/me")
            .then((response) => {
                if (!cancelled) setProfile(response.data);
            })
            .catch((requestError) => {
                console.error("Student profile error:", requestError);
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                        "Unable to load your profile."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <StudentLayout>
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>Your student and academic information.</p>
                    </div>
                </div>
                {loading && <div className="loading" role="status">Loading your profile...</div>}
                {error && <div className="error-message" role="alert">{error}</div>}
                {!loading && !error && profile && (
                    <section className="faculty-profile-card" aria-label="Student profile">
                        <div>
                            <span className="faculty-profile-label">Name</span>
                            <strong>{profile.fullName}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Username</span>
                            <strong>{profile.username}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Email</span>
                            <strong>{profile.email || "Not provided"}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Roll Number</span>
                            <strong>{profile.rollNumber}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Department</span>
                            <strong>{profile.departmentName} ({profile.departmentCode})</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Program</span>
                            <strong>{profile.programName} ({profile.programCode})</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Current Semester</span>
                            <strong>Semester {profile.semesterNumber}</strong>
                        </div>
                        <div>
                            <span className="faculty-profile-label">Academic Year</span>
                            <strong>{profile.academicYear}</strong>
                        </div>
                    </section>
                )}
            </div>
        </StudentLayout>
    );
}

export default StudentProfile;
