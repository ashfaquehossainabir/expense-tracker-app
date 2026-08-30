import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAllUsers, updateUserByAdmin, setUserActiveStatus, deleteUserByAdmin } from "../api/adminApi";
import AdminUserRow from "../components/AdminUserRow";
import EditUserModal from "../components/EditUserModal";
import ConfirmUserActionModal from "../components/ConfirmUserActionModal";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Deactivated" },
];

const ROLE_FILTERS = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admins" },
  { value: "user", label: "Users" },
];

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editingUser, setEditingUser] = useState(null);

  const [statusTarget, setStatusTarget] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load users. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "inactive" && u.isActive) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, statusFilter, roleFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      admins: users.filter((u) => u.role === "admin").length,
    }),
    [users]
  );

  const handleEditSubmit = async (id, payload) => {
    const updated = await updateUserByAdmin(id, payload);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    setEditingUser(null);
  };

  const requestToggleStatus = (user) => {
    setActionError("");
    setStatusTarget(user);
  };

  const confirmToggleStatus = async () => {
    if (!statusTarget) return;
    setTogglingStatus(true);
    setActionError("");
    try {
      const updated = await setUserActiveStatus(statusTarget.id, !statusTarget.isActive);
      setUsers((prev) => prev.map((u) => (u.id === statusTarget.id ? { ...u, ...updated } : u)));
      setStatusTarget(null);
    } catch (err) {
      setActionError(err.response?.data?.message || "Couldn't update that account's status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const requestDelete = (user) => {
    setActionError("");
    setDeleteTarget(user);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError("");
    try {
      await deleteUserByAdmin(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err.response?.data?.message || "Couldn't delete that user.");
    } finally {
      setDeleting(false);
    }
  };

  const showEmptyState = !loading && !error && filteredUsers.length === 0;

  return (
    <div className="admin-page">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-left">
            <Link to="/" className="admin-back-link" aria-label="Back to Ledger">
              ← Ledger
            </Link>
            <div className="app-header-titles">
              <h1 className="app-title">Admin Panel</h1>
              <div className="app-subtitle">
                {currentUser ? `Signed in as ${currentUser.name}` : "User management"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-shell">
        <div className="admin-stats">
          <div className="admin-stat-chip">
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-label">Total users</span>
          </div>
          <div className="admin-stat-chip">
            <span className="admin-stat-value">{stats.active}</span>
            <span className="admin-stat-label">Active</span>
          </div>
          <div className="admin-stat-chip">
            <span className="admin-stat-value">{stats.inactive}</span>
            <span className="admin-stat-label">Deactivated</span>
          </div>
          <div className="admin-stat-chip">
            <span className="admin-stat-value">{stats.admins}</span>
            <span className="admin-stat-label">Admins</span>
          </div>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
          <div className="admin-filters">
            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by role"
            >
              {ROLE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {actionError && <div className="status-line error">{actionError}</div>}
        {loading && (
          <div className="status-line status-line-loading">
            <span className="mini-spinner" aria-hidden="true" />
            Loading users…
          </div>
        )}
        {error && <div className="status-line error">{error}</div>}

        {!loading && !error && (
          <div className="admin-table-card">
            <div className="admin-user-row admin-user-row-head" aria-hidden="true">
              <div className="admin-user-identity">Name</div>
              <div className="admin-user-meta">
                <div className="admin-user-cell">Role</div>
                <div className="admin-user-cell">Status</div>
                <div className="admin-user-cell">Joined</div>
                <div className="admin-user-cell">Entries</div>
              </div>
              <div className="admin-user-actions">Actions</div>
            </div>

            {filteredUsers.map((u) => (
              <AdminUserRow
                key={u.id}
                user={u}
                isSelf={currentUser?.id === u.id}
                onEdit={setEditingUser}
                onToggleStatus={requestToggleStatus}
                onDelete={requestDelete}
              />
            ))}

            {showEmptyState && (
              <div className="empty-state">
                {users.length === 0 ? "No users found." : "No users match your filters."}
              </div>
            )}
          </div>
        )}
      </div>

      <EditUserModal
        open={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmUserActionModal
        open={Boolean(statusTarget)}
        title={statusTarget?.isActive ? "Deactivate Account" : "Activate Account"}
        message={
          statusTarget?.isActive
            ? `Deactivate ${statusTarget?.name}'s account? They won't be able to log in until an admin reactivates it.`
            : `Reactivate ${statusTarget?.name}'s account? They'll be able to log in again.`
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        pendingLabel={statusTarget?.isActive ? "Deactivating…" : "Activating…"}
        danger={Boolean(statusTarget?.isActive)}
        onCancel={() => !togglingStatus && setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
        working={togglingStatus}
      />

      <ConfirmUserActionModal
        open={Boolean(deleteTarget)}
        title="Delete User"
        message={`Permanently delete ${deleteTarget?.name}'s account and all of their income and expense entries? This can't be undone.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        danger
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        working={deleting}
      />
    </div>
  );
}
