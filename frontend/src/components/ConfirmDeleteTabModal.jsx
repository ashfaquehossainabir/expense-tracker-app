export default function ConfirmDeleteTabModal({ open, tab, onCancel, onConfirm, deleting }) {
  if (!open) return null;

  const entryCount = (tab?.expenseCount || 0) + (tab?.incomeCount || 0);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-tab-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-delete-tab-title">
            Delete Tab
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <p className="confirm-text">
          Delete <strong>{tab?.name}</strong>
          {entryCount > 0 ? (
            <>
              {" "}
              and all <strong>{entryCount}</strong> {entryCount === 1 ? "entry" : "entries"}{" "}
              logged in it
            </>
          ) : (
            ""
          )}
          ? This permanently removes the tab and its data from the database and can't be undone.
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete Tab"}
          </button>
        </div>
      </div>
    </div>
  );
}
