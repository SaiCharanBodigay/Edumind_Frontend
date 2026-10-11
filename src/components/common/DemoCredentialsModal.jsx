import { useState } from "react";
import { Modal } from "./Modal";
import { Icon } from "./Icons";

export function DemoCredentialsModal({ isOpen, onClose, onSelectCredentials }) {
    const [copiedKey, setCopiedKey] = useState(null);

    const demoAccounts = [
        {
            role: "Admin",
            roleBadge: "Administrative Portal",
            username: "admin",
            password: "Admin@123456",
            icon: "shield",
            description: "Full access to campus hierarchy, departments, courses, faculty allocations, and bulk imports.",
            notice: "Staging evaluation account. In production, change the default bootstrap password."
        },
        {
            role: "Faculty",
            roleBadge: "Faculty Portal",
            username: "faculty01",
            password: "Instacks@2028",
            icon: "teacher",
            description: "Course management, learning material uploads, assignment grading, and quiz builder.",
            notice: null
        },
        {
            role: "Student",
            roleBadge: "Student Portal",
            username: "24EG105K10",
            password: "Instacks@2028",
            icon: "graduation-cap",
            description: "Course enrollments, study materials, assignment submissions, and timed quiz assessments.",
            notice: null
        }
    ];

    const copyToClipboard = async (text, key) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setCopiedKey(key);
            setTimeout(() => {
                setCopiedKey((curr) => (curr === key ? null : curr));
            }, 2000);
        } catch {
            // Silently handle clipboard write error
        }
    };

    const handleCopyBoth = (acc) => {
        const text = `Username: ${acc.username}\nPassword: ${acc.password}`;
        copyToClipboard(text, `${acc.role}-both`);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Staging Demo Accounts"
            description="Demonstration credentials provided for faculty, evaluators, and staff reviewing the staging deployment of EduMind."
            maxWidth="640px"
            footer={
                <div className="demo-modal-footer">
                    <p className="demo-security-disclaimer">
                        <Icon name="shield" size={14} />
                        <span>
                            <strong>Security Notice:</strong> Staging only. These accounts must never be exposed or used on production environments.
                        </span>
                    </p>
                    <button type="button" className="secondary-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            }
        >
            <div className="demo-accounts-list">
                {demoAccounts.map((account) => (
                    <article key={account.role} className="demo-account-card">
                        <div className="demo-account-header">
                            <div className="demo-account-identity">
                                <span className={`demo-role-icon ${account.role.toLowerCase()}`}>
                                    <Icon name={account.icon} size={18} />
                                </span>
                                <div>
                                    <div className="demo-account-title-row">
                                        <h3 className="demo-account-title">{account.role}</h3>
                                        <span className={`demo-role-badge ${account.role.toLowerCase()}`}>
                                            {account.roleBadge}
                                        </span>
                                    </div>
                                    <p className="demo-account-desc">{account.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="demo-credentials-box">
                            <div className="demo-cred-row">
                                <span className="demo-cred-label">Username</span>
                                <code className="demo-cred-value">{account.username}</code>
                                <button
                                    type="button"
                                    className="demo-copy-btn"
                                    onClick={() => copyToClipboard(account.username, `${account.role}-user`)}
                                    title="Copy username"
                                    aria-label={`Copy username for ${account.role}`}
                                >
                                    <Icon
                                        name={copiedKey === `${account.role}-user` ? "check" : "copy"}
                                        size={14}
                                    />
                                    <span>
                                        {copiedKey === `${account.role}-user` ? "Copied" : "Copy"}
                                    </span>
                                </button>
                            </div>

                            <div className="demo-cred-row">
                                <span className="demo-cred-label">Password</span>
                                <code className="demo-cred-value">{account.password}</code>
                                <button
                                    type="button"
                                    className="demo-copy-btn"
                                    onClick={() => copyToClipboard(account.password, `${account.role}-pass`)}
                                    title="Copy password"
                                    aria-label={`Copy password for ${account.role}`}
                                >
                                    <Icon
                                        name={copiedKey === `${account.role}-pass` ? "check" : "copy"}
                                        size={14}
                                    />
                                    <span>
                                        {copiedKey === `${account.role}-pass` ? "Copied" : "Copy"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {account.notice && (
                            <p className="demo-account-notice">
                                <Icon name="alert-circle" size={13} />
                                <span>{account.notice}</span>
                            </p>
                        )}

                        <div className="demo-actions-row">
                            <button
                                type="button"
                                className="demo-action-btn secondary"
                                onClick={() => handleCopyBoth(account)}
                            >
                                <Icon
                                    name={copiedKey === `${account.role}-both` ? "check" : "copy"}
                                    size={14}
                                />
                                <span>
                                    {copiedKey === `${account.role}-both` ? "Copied Both!" : "Copy Both"}
                                </span>
                            </button>

                            {onSelectCredentials && (
                                <button
                                    type="button"
                                    className="demo-action-btn primary"
                                    onClick={() => {
                                        onSelectCredentials(account.username, account.password);
                                        onClose();
                                    }}
                                >
                                    <span>Use In Form</span>
                                    <Icon name="chevron-right" size={14} />
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </Modal>
    );
}
