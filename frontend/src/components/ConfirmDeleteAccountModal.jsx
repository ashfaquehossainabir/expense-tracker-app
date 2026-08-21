import { useEffect, useState } from "react";

export default function ConfirmDeleteAccountModal({ open, onCancel, onConfirm, deleting }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    setError("");
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete your account. Try again.");
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && !deleting && onCancel()}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-account-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-delete-account-title">
            Delete Account
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close" disabled={deleting}>
            ×
          </button>
        </div>

        <p className="confirm-text">
          This permanently deletes your account and every income and expense entry you've
          logged. This can't be undone. Enter your password to confirm.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="delete-account-password">Password</label>
            <input
              id="delete-account-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            {error && <div className="field-error">{error}</div>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={deleting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={deleting}>
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
