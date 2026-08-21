const getInitials = (name, email) => {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
};

export default function UserAvatar({ user, onClick }) {
  const initials = getInitials(user?.name, user?.email);

  return (
    <button
      type="button"
      className="avatar-button"
      onClick={onClick}
      aria-label="Open account settings"
      title={user?.name || "Account settings"}
    >
      <span className="avatar-circle">{initials}</span>
    </button>
  );
}
