export function Icon({ name, size = 18, className = "", color = "currentColor", ...props }) {
    const iconProps = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: `em-icon ${className}`,
        ...props
    };

    switch (name) {
        case "dashboard":
            return (
                <svg {...iconProps}>
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
            );
        case "students":
        case "user-group":
            return (
                <svg {...iconProps}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        case "faculty":
        case "teacher":
            return (
                <svg {...iconProps}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case "department":
        case "building":
            return (
                <svg {...iconProps}>
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <path d="M9 22v-4h6v4" />
                    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                </svg>
            );
        case "program":
        case "award":
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
            );
        case "academic-year":
        case "calendar":
            return (
                <svg {...iconProps}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            );
        case "semester":
        case "layers":
            return (
                <svg {...iconProps}>
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                </svg>
            );
        case "structure":
        case "network":
            return (
                <svg {...iconProps}>
                    <rect x="16" y="16" width="6" height="6" rx="1" />
                    <rect x="2" y="16" width="6" height="6" rx="1" />
                    <rect x="9" y="2" width="6" height="6" rx="1" />
                    <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
                    <path d="M12 12V8" />
                </svg>
            );
        case "class-incharge":
        case "user-check":
            return (
                <svg {...iconProps}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                </svg>
            );
        case "courses":
        case "book":
            return (
                <svg {...iconProps}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            );
        case "allocation":
        case "git-commit":
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="12" r="4" />
                    <line x1="1.05" y1="12" x2="7" y2="12" />
                    <line x1="17.01" y1="12" x2="22.96" y2="12" />
                </svg>
            );
        case "import":
        case "upload-cloud":
            return (
                <svg {...iconProps}>
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    <polyline points="16 16 12 12 8 16" />
                </svg>
            );
        case "materials":
        case "folder":
            return (
                <svg {...iconProps}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
            );
        case "assignments":
        case "clipboard-list":
            return (
                <svg {...iconProps}>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M9 14h6" />
                    <path d="M9 18h6" />
                    <path d="M9 10h6" />
                </svg>
            );
        case "quizzes":
        case "help-circle":
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            );
        case "sections":
        case "grid":
            return (
                <svg {...iconProps}>
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                </svg>
            );
        case "profile":
        case "user":
            return (
                <svg {...iconProps}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case "logout":
            return (
                <svg {...iconProps}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            );
        case "search":
            return (
                <svg {...iconProps}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            );
        case "filter":
            return (
                <svg {...iconProps}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
            );
        case "plus":
            return (
                <svg {...iconProps}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            );
        case "trash":
            return (
                <svg {...iconProps}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
            );
        case "edit":
            return (
                <svg {...iconProps}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            );
        case "eye":
            return (
                <svg {...iconProps}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        case "eye-off":
            return (
                <svg {...iconProps}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            );
        case "copy":
            return (
                <svg {...iconProps}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            );
        case "check":
            return (
                <svg {...iconProps}>
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            );
        case "check-circle":
            return (
                <svg {...iconProps}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            );
        case "x":
        case "close":
            return (
                <svg {...iconProps}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            );
        case "x-circle":
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        case "menu":
            return (
                <svg {...iconProps}>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            );
        case "chevron-left":
            return (
                <svg {...iconProps}>
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            );
        case "chevron-right":
            return (
                <svg {...iconProps}>
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            );
        case "chevron-down":
            return (
                <svg {...iconProps}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            );
        case "clock":
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            );
        case "alert-circle":
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            );
        case "shield":
            return (
                <svg {...iconProps}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            );
        case "download":
            return (
                <svg {...iconProps}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            );
        case "external-link":
            return (
                <svg {...iconProps}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            );
        case "graduation-cap":
            return (
                <svg {...iconProps}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            );
        case "key":
            return (
                <svg {...iconProps}>
                    <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5 1.5-1.5-1.5-1.5L9 6 3 12l2 2 4-4 2 2 4-4" />
                    <circle cx="15.5" cy="8.5" r="5.5" />
                </svg>
            );
        case "sparkles":
            return (
                <svg {...iconProps}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
            );
        case "file":
        default:
            return (
                <svg {...iconProps}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            );
    }
}

export function EduMindWordmark({ className = "", compact = false }) {
    return (
        <div className={`em-brand-mark ${compact ? "em-brand-compact" : ""} ${className}`}>
            <div className="em-logo-symbol">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="url(#brand-grad)" />
                    <path d="M8 12L16 7L24 12L16 17L8 12Z" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M11 14.5V20.5C11 22.5 13.5 24.5 16 24.5C18.5 24.5 21 22.5 21 20.5V14.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="16" cy="16.5" r="1.5" fill="#FFFFFF" />
                    <defs>
                        <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4F46E5" />
                            <stop offset="1" stopColor="#312E81" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            {!compact && (
                <div className="em-brand-text">
                    <span className="em-brand-title">EduMind</span>
                    <span className="em-brand-tagline">University LMS</span>
                </div>
            )}
        </div>
    );
}
