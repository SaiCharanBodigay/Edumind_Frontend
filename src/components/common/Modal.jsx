import { useEffect, useRef } from "react";
import { Icon } from "./Icons";

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = "540px",
    closeOnBackdrop = true
}) {
    const modalRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        previouslyFocusedRef.current = document.activeElement;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCloseRef.current?.();
                return;
            }

            if (event.key === "Tab" && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll(
                    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable.length) {
                    event.preventDefault();
                    modalRef.current.focus();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        // Auto focus modal container
        const currentRef = modalRef.current;
        if (currentRef) {
            const firstFocusable = currentRef.querySelector(
                'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
            );
            (firstFocusable || currentRef).focus();
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
            if (previouslyFocusedRef.current?.isConnected) {
                previouslyFocusedRef.current.focus();
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div
            className="em-modal-backdrop"
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                className="em-modal-dialog"
                style={{ maxWidth }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "em-modal-title" : undefined}
                aria-describedby={description ? "em-modal-desc" : undefined}
                ref={modalRef}
                tabIndex={-1}
            >
                <div className="em-modal-header">
                    <div>
                        {title && <h2 id="em-modal-title" className="em-modal-title">{title}</h2>}
                        {description && <p id="em-modal-desc" className="em-modal-desc">{description}</p>}
                    </div>
                    <button
                        type="button"
                        className="em-modal-close"
                        onClick={onClose}
                        aria-label="Close modal dialog"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>

                <div className="em-modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="em-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    loading = false
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="440px"
            footer={
                <div className="em-modal-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={isDestructive ? "delete-button" : "primary-button"}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            }
        >
            <div className="em-confirm-body">
                <div className={`em-confirm-icon ${isDestructive ? "destructive" : "info"}`}>
                    <Icon name={isDestructive ? "alert-circle" : "shield"} size={24} />
                </div>
                <p className="em-confirm-text">{message}</p>
            </div>
        </Modal>
    );
}
