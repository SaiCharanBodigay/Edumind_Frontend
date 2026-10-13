import { useEffect, useState } from "react";
import "./LandingPage.css";

const roles = [
    { key: "student", name: "Student", path: "/student/login", icon: "↗", title: "Your courses, in focus.", description: "Learning resources, assignments, quizzes and released results come together in your academic workspace.", items: ["Course materials", "Assignment submissions", "Quizzes & results"] },
    { key: "faculty", name: "Faculty", path: "/faculty/login", icon: "✳", title: "Teaching, thoughtfully connected.", description: "Organize course resources, create assignments and quizzes, then review student work.", items: ["Teaching resources", "Assignments & quizzes", "Submission review"] },
    { key: "admin", name: "Admin", path: "/admin/login", icon: "⌘", title: "A clearer view of academics.", description: "Manage academic users, course structures and platform operations within assigned permissions.", items: ["Academic users", "Courses & structure", "Platform operations"] },
];

const features = [
    ["◫", "Learning materials", "Course resources shared by faculty, together in one place."],
    ["↗", "Assignments", "Submit coursework and follow assignment status and feedback."],
    ["◎", "Quizzes & assessments", "Take online quizzes and review results released by faculty."],
    ["⌁", "Academic progress", "Keep coursework, quiz attempts, and released results in view."],
    ["✳", "Teaching workflow", "Faculty can share materials, create assessments, and review submissions."],
    ["◈", "Role-based access", "Each university role enters a workspace aligned to its permissions."],
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

function HeroDashboard() {
    return <div className="lx-dashboard-wrap" aria-label="Illustrative EduMind dashboard preview">
        <div className="lx-orbit lx-orbit-one" /><div className="lx-orbit lx-orbit-two" />
        <div className="lx-dash-glow" />
        <div className="lx-dashboard lx-float-slow">
            <div className="lx-dash-top"><span className="lx-window-dots"><i /><i /><i /></span><span className="lx-dash-brand"><b>e</b> EDUMIND <i>/</i> LEARNING SPACE</span><span className="lx-avatar">AU</span></div>
            <div className="lx-dash-layout"><aside className="lx-dash-side"><b>e</b><span className="selected">▦</span><span>▤</span><span>◷</span><span>⌑</span><span className="lx-side-bottom">⚙</span></aside>
                <div className="lx-dash-main"><div className="lx-dash-heading"><div><small>YOUR ACADEMIC SPACE</small><h3>Keep learning forward.</h3><p>Everything for your courses, together.</p></div><span className="lx-semester">STUDENT VIEW <i>⌄</i></span></div>
                    <div className="lx-dash-metrics"><div><small>COURSES</small><b><i className="lx-metric-icon">▤</i> Course space</b><span>Materials & resources <Arrow /></span></div><div><small>UP NEXT</small><b><i className="lx-metric-icon violet">◷</i> Assignments</b><span>Work in progress <Arrow /></span></div></div>
                    <div className="lx-dash-lower"><div className="lx-activity"><div className="lx-activity-title"><b>Learning activity</b><span>Recent quiz result</span></div><div className="lx-chart"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="lx-chart-labels"><span>QUIZ</span><span>RESULTS WHEN RELEASED</span></div></div><div className="lx-focus"><span>YOUR LEARNING</span><b>One step<br />at a time.</b><div className="lx-ring"><i>→</i></div></div></div>
                </div>
            </div>
        </div>
        <div className="lx-float-card lx-float-course"><span className="lx-float-symbol">▧</span><div><small>COURSE MATERIAL</small><b>Resources are ready</b></div><i>↗</i></div>
        <div className="lx-float-card lx-float-quiz"><span className="lx-float-symbol purple">◎</span><div><small>QUIZ SPACE</small><b>Pick up where you left off</b></div><span className="lx-pulse-dot" /></div>
        <div className="lx-float-note"><span>EDUMIND / 01</span><b>Learning,<br />in one place.</b><div><i /> CONNECTED ACADEMIC SPACE</div></div>
    </div>;
}

function RolePreview({ role }) {
    if (role.key === "student") return <div className="lx-role-mock student-mock"><div className="lx-mock-head"><div><small>STUDENT WORKSPACE</small><b>My learning</b></div><span>AU</span></div><div className="lx-mock-course"><i>01</i><div><small>COURSE MATERIALS</small><b>Resources & notes</b></div><Arrow /></div><div className="lx-mock-course"><i className="mint">02</i><div><small>MY COURSEWORK</small><b>Assignments & quizzes</b></div><Arrow /></div><div className="lx-mock-status"><span>RECENT ACTIVITY</span><b>Quiz results appear here when released</b><div><i /></div></div></div>;
    if (role.key === "faculty") return <div className="lx-role-mock faculty-mock"><div className="lx-mock-head"><div><small>FACULTY WORKSPACE</small><b>Teaching desk</b></div><span>✳</span></div><div className="lx-faculty-banner"><small>COURSE RESOURCES</small><b>Share what<br />helps them learn.</b><span>Learning materials <Arrow /></span></div><div className="lx-faculty-actions"><div><i>▤</i><b>Assignments</b><small>Create & manage</small></div><div><i>◎</i><b>Quizzes</b><small>Assess learning</small></div><div><i>✓</i><b>Submissions</b><small>Review student work</small></div></div></div>;
    return <div className="lx-role-mock admin-mock"><div className="lx-mock-head"><div><small>ADMIN WORKSPACE</small><b>Academic operations</b></div><span>⌘</span></div><div className="lx-admin-nav"><span>OVERVIEW</span><span>ACADEMICS</span><span>PEOPLE</span></div><div className="lx-admin-rows"><div><i>▦</i><span><b>Academic structure</b><small>Programs · departments · semesters</small></span><Arrow /></div><div><i>♙</i><span><b>Faculty & students</b><small>Manage academic users</small></span><Arrow /></div><div><i>⌑</i><span><b>Course operations</b><small>Courses · allocations · sections</small></span><Arrow /></div></div><div className="lx-admin-foot"><i /> ROLE-BASED PLATFORM ACCESS</div></div>;
}

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeRole, setActiveRole] = useState(roles[0]);
    useEffect(() => {
        const nodes = document.querySelectorAll(".lx-reveal");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            nodes.forEach((node) => node.classList.add("is-visible"));
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
        }), { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, []);
    const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setMenuOpen(false); };
    const headline = ["Your Learning", "Journey, Elevated."];

    return <div className="edumind-landing">
        <header className="lx-header"><div className="lx-header-inner">
            <a href="#home" className="lx-brand" aria-label="EduMind home"><img src="/anurag-university-logo.png" alt="Anurag University" /><span className="lx-brand-divider" /><span className="lx-brand-product"><b>EduMind</b><small>Learning Management System <i>|</i> Anurag University</small></span></a>
            <button className="lx-menu-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
            <nav className={menuOpen ? "lx-nav open" : "lx-nav"} aria-label="Main navigation"><a href="#home" onClick={() => setMenuOpen(false)}>Home</a><button onClick={() => scrollTo("why")}>Why EduMind</button><button onClick={() => scrollTo("experiences")}>Workspaces</button><button onClick={() => scrollTo("how")}>How it works</button><a className="lx-nav-cta" href="/student/login">Login <Arrow /></a></nav>
        </div></header>
        <main>
            <section className="lx-hero" id="home"><div className="lx-hero-beam" /><div className="lx-hero-grid" /><div className="lx-hero-stars" />
                <div className="lx-hero-inner"><div className="lx-hero-copy"><div className="lx-eyebrow lx-enter"><i /> ANURAG UNIVERSITY <span>·</span> DIGITAL LEARNING</div>
                    <h1>{headline.map((line, lineIndex) => <span className="lx-headline-line" key={line}>{line.split(" ").map((word, wordIndex) => <span className="lx-word" style={{ "--word-delay": `${0.2 + lineIndex * 0.36 + wordIndex * 0.1}s` }} key={word}>{word}<i> </i></span>)}</span>)}</h1>
                    <p className="lx-hero-description lx-enter delay-5">EduMind brings students, faculty, and administrators together in one connected learning space. Access course materials, manage assignments, take online quizzes, and stay on top of your academic progress.</p>
                    <div className="lx-hero-actions lx-enter delay-6"><button className="lx-button lx-button-primary" onClick={() => scrollTo("why")}>Explore EduMind <Arrow /></button><a className="lx-button lx-button-glass" href="/student/login">Login to EduMind <span>→</span></a></div>
                    <div className="lx-hero-access lx-enter delay-7"><i /> Secure access for authorized university accounts</div>
                </div><HeroDashboard /></div>
                <div className="lx-hero-footer"><span>EDUMIND <i>·</i> ANURAG UNIVERSITY</span><button onClick={() => scrollTo("why")}>SCROLL TO EXPLORE <span>↓</span></button><span>LEARNING, CONNECTED</span></div>
            </section>
            <section className="lx-why" id="why"><div className="lx-section-wrap"><div className="lx-section-heading lx-reveal"><div><span className="lx-kicker">THE LEARNING SPACE THAT MOVES WITH YOU</span><h2>Why <em>EduMind?</em></h2></div><p>Academic life has a rhythm. EduMind brings the resources, activities and role-based tools that keep it flowing.</p></div>
                <div className="lx-feature-grid">{features.map(([icon, title, description], index) => <article className="lx-feature lx-reveal" style={{ "--reveal-delay": `${index * 75}ms` }} key={title}><div className="lx-feature-icon">{icon}</div><span className="lx-feature-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p><i className="lx-feature-orb" /></article>)}</div>
            </div></section>
            <section className="lx-experiences" id="experiences"><div className="lx-section-wrap"><div className="lx-section-heading lx-reveal"><div><span className="lx-kicker">ONE COMMUNITY, DISTINCT WORKSPACES</span><h2>Learning has a place<br />for <em>everyone.</em></h2></div><p>Choose a role to preview its learning workspace. Access follows your university account and assigned permissions.</p></div>
                <div className="lx-role-tabs lx-reveal" role="tablist" aria-label="Workspace previews">{roles.map((role) => <button type="button" role="tab" aria-selected={activeRole.key === role.key} className={activeRole.key === role.key ? "active" : ""} key={role.key} onClick={() => setActiveRole(role)}><span>{role.icon}</span>{role.name}<i>↗</i></button>)}</div>
                <div className="lx-role-showcase lx-reveal" role="tabpanel"><div className="lx-role-description"><span className="lx-kicker">{activeRole.name.toUpperCase()} WORKSPACE</span><h3>{activeRole.title}</h3><p>{activeRole.description}</p><ul>{activeRole.items.map((item) => <li key={item}><i>✓</i>{item}</li>)}</ul><a className="lx-role-link" href={activeRole.path}>Enter {activeRole.name.toLowerCase()} login <Arrow /></a></div><div className="lx-role-preview-stage"><div className="lx-role-stage-glow" /><RolePreview role={activeRole} /></div></div>
            </div></section>
            <section className="lx-how" id="how"><div className="lx-section-wrap"><div className="lx-how-intro lx-reveal"><span className="lx-kicker">A CLEAR PATH INTO YOUR ACADEMIC SPACE</span><h2>Three steps.<br /><em>One connected experience.</em></h2></div><div className="lx-steps">{[["01", "Sign in securely", "Use your authorized university account to access EduMind."], ["02", "Open your workspace", "Your role guides you to the academic tools available to you."], ["03", "Keep learning moving", "Access courses, resources, and academic activities." ]].map(([number, title, description], index) => <article className="lx-step lx-reveal" style={{ "--reveal-delay": `${index * 110}ms` }} key={number}><span className="lx-step-number">{number}</span><div className="lx-step-line"><i /></div><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
            <section className="lx-cta" id="contact"><div className="lx-cta-glow" /><div className="lx-cta-inner lx-reveal"><span className="lx-kicker">YOUR ACADEMIC SPACE AWAITS</span><h2>Ready to make every<br />learning moment count?</h2><p>Your academic workspace is just one sign-in away.</p><a className="lx-button lx-button-primary" href="/student/login">Get Started <Arrow /></a></div><div className="lx-cta-orbit" /></section>
        </main>
        <footer className="lx-footer"><div className="lx-footer-main"><div className="lx-footer-brand"><div className="lx-footer-identity"><img src="/anurag-university-logo.png" alt="" /><span><b>EduMind</b><small>Learning Management System | Anurag University</small></span></div><p>A learning platform associated with Anurag University.</p></div><div className="lx-footer-links"><span>EXPLORE</span><a href="#home">Home</a><a href="#why">Why EduMind</a><a href="#experiences">Workspaces</a><a href="#how">How it works</a></div><div className="lx-footer-links"><span>WORKSPACES</span>{roles.map((role) => <a href={role.path} key={role.key}>{role.name}</a>)}</div></div><div className="lx-footer-bottom"><span>© {new Date().getFullYear()} EduMind · Anurag University</span><span>For authorized university users</span></div></footer>
    </div>;
}
