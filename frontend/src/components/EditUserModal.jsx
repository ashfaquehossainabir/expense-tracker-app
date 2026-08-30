import { useEffect, useState } from "react";

export default function EditUserModal({ open, user, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name || "", email: user.email || "", role: user.role || "user" });
      setErrors({});
      setServerError("");
      setSaving(false);
    }
  }, [open, user]);

  if (!open || !user) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a name.";
    if (!form.email.trim()) {
      next.email = "Enter an email.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit(user.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      });
    } catch (err) {
      setServerError(err.response?.data?.message || "Couldn't save this user. Try again.");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="edit-user-title">
            Edit User
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={saving}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="edit-user-name">Name</label>
            <input
              id="edit-user-name"
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              autoComplete="off"
              disabled={saving}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="field">
            <label htmlFor="edit-user-email">Email</label>
            <input
              id="edit-user-email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              autoComplete="off"
              disabled={saving}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="edit-user-role">Role</label>
            <select
              id="edit-user-role"
              value={form.role}
              onChange={handleChange("role")}
              disabled={saving}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {serverError && <div className="field-error">{serverError}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
