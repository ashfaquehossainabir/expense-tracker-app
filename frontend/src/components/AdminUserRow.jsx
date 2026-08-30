const getInitials = (name, email) => {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

export default function AdminUserRow({ user, isSelf, onEdit, onToggleStatus, onDelete }) {
  const initials = getInitials(user.name, user.email);

  return (
    <div className={`admin-user-row ${isSelf ? "is-self" : ""}`}>
      <div className="admin-user-identity">
        <span className="avatar-circle">{initials}</span>
        <div className="admin-user-identity-text">
          <div className="admin-user-name">
            {user.name}
            {isSelf && <span className="you-badge">You</span>}
          </div>
          <div className="admin-user-email">{user.email}</div>
        </div>
      </div>

      <div className="admin-user-meta">
        <div className="admin-user-cell" data-label="Role">
          <span className={`role-badge ${user.role === "admin" ? "admin" : ""}`}>{user.role}</span>
        </div>

        <div className="admin-user-cell" data-label="Status">
          <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
            {user.isActive ? "Active" : "Deactivated"}
          </span>
        </div>

        <div className="admin-user-cell" data-label="Joined">
          {formatDate(user.createdAt)}
        </div>

        <div className="admin-user-cell" data-label="Entries">
          <span className="entries-count">
            {user.expenseCount || 0} exp · {user.incomeCount || 0} inc
          </span>
        </div>
      </div>

      <div className="admin-user-actions" data-label="Actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => onEdit(user)}
          disabled={isSelf}
          title={isSelf ? "Use Account Settings to edit your own profile" : "Edit user"}
          aria-label={`Edit ${user.name}`}
        >
          ✎
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => onToggleStatus(user)}
          disabled={isSelf}
          title={
            isSelf
              ? "You can't deactivate your own account"
              : user.isActive
              ? "Deactivate account"
              : "Activate account"
          }
          aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.name}`}
        >
          {user.isActive ? "⏻" : "↺"}
        </button>
        <button
          type="button"
          className="icon-button danger"
          onClick={() => onDelete(user)}
          disabled={isSelf}
          title={isSelf ? "You can't delete your own account here" : "Delete user"}
          aria-label={`Delete ${user.name}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
