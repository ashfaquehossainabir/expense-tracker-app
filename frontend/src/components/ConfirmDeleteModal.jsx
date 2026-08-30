import { useAuth } from "../context/AuthContext";
import { formatAmount } from "../utils/currency";

export default function ConfirmDeleteModal({ open, item, itemLabel = "Entry", onCancel, onConfirm, deleting }) {
  const { user } = useAuth();
  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-delete-title">
            Delete {itemLabel}
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>

        <p className="confirm-text">
          Remove <strong>{item?.title}</strong> for{" "}
          <strong>{formatAmount(item?.amount ?? 0, user?.currency)}</strong> from the ledger?
          This can't be undone.
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
