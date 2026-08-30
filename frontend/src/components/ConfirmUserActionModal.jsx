export default function ConfirmUserActionModal({
  open,
  title,
  message,
  confirmLabel,
  pendingLabel,
  danger = true,
  onCancel,
  onConfirm,
  working,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && !working && onCancel()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-user-action-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-user-action-title">
            {title}
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close" disabled={working}>
            ×
          </button>
        </div>

        <p className="confirm-text">{message}</p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={working}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={working}
          >
            {working ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
