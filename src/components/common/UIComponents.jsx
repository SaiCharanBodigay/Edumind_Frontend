import { Icon } from "./Icons";

export function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon,
    iconRight,
    type = "button",
    className = "",
    ...props
}) {
    const variantClass = {
        primary: "primary-button",
        secondary: "secondary-button",
        danger: "delete-button",
        outline: "outline-button",
        ghost: "ghost-button"
    }[variant] || "primary-button";

    const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${variantClass} ${sizeClass} ${loading ? "is-loading" : ""} ${className}`}
            {...props}
        >
            {loading && <span className="em-spinner" aria-hidden="true" />}
            {!loading && icon && <Icon name={icon} size={size === "sm" ? 14 : 16} className="btn-icon" />}
            <span>{children}</span>
            {!loading && iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} className="btn-icon-right" />}
        </button>
    );
}

export function Badge({ children, variant = "default", className = "" }) {
    return (
        <span className={`em-badge em-badge-${variant} ${className}`}>
            {children}
        </span>
    );
}

export function PageHeader({
    title,
    description,
    badge,
    breadcrumbs = [],
    actions,
    className = ""
}) {
    return (
        <header className={`em-page-header ${className}`}>
            <div className="em-page-header-main">
                {breadcrumbs.length > 0 && (
                    <nav className="em-breadcrumbs" aria-label="Breadcrumb">
                        <ol>
                            {breadcrumbs.map((crumb, idx) => (
                                <li key={idx} className="em-breadcrumb-item">
                                    {crumb.href ? (
                                        <a href={crumb.href}>{crumb.label}</a>
                                    ) : (
                                        <span>{crumb.label}</span>
                                    )}
                                    {idx < breadcrumbs.length - 1 && (
                                        <Icon name="chevron-right" size={12} className="em-breadcrumb-sep" />
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}
                <div className="em-page-header-title-row">
                    <h1 className="em-page-title">{title}</h1>
                    {badge && <div className="em-page-badge">{badge}</div>}
                </div>
                {description && <p className="em-page-description">{description}</p>}
            </div>
            {actions && <div className="em-page-actions">{actions}</div>}
        </header>
    );
}

export function EmptyState({
    icon = "folder",
    title = "No records found",
    description,
    action,
    className = ""
}) {
    return (
        <div className={`em-empty-state ${className}`}>
            <div className="em-empty-icon">
                <Icon name={icon} size={28} />
            </div>
            <h3 className="em-empty-title">{title}</h3>
            {description && <p className="em-empty-description">{description}</p>}
            {action && <div className="em-empty-action">{action}</div>}
        </div>
    );
}

export function LoadingSkeleton({ lines = 3, type = "card", className = "" }) {
    if (type === "table") {
        return (
            <div className={`em-skeleton-table ${className}`} aria-hidden="true">
                <div className="em-skeleton-row header" />
                {Array.from({ length: lines }).map((_, i) => (
                    <div key={i} className="em-skeleton-row" />
                ))}
            </div>
        );
    }

    return (
        <div className={`em-skeleton-card ${className}`} aria-hidden="true">
            <div className="em-skeleton-line title" />
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="em-skeleton-line" />
            ))}
        </div>
    );
}
