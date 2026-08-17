export default function ConfirmLogoutModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-logout-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-logout-title">
            Log Out
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <p className="confirm-text">
          Are you sure you want to log out? You'll need to log back in to see your ledger.
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
