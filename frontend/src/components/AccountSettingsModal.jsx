import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const getInitials = (name, email) => {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
};

export default function AccountSettingsModal({ open, onClose, onRequestLogout, onRequestDelete }) {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileStatus, setProfileStatus] = useState({ saving: false, message: "", error: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({ saving: false, message: "", error: "" });

  useEffect(() => {
    if (!open) return;
    setProfileForm({ name: user?.name ?? "", email: user?.email ?? "" });
    setProfileErrors({});
    setProfileStatus({ saving: false, message: "", error: "" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
    setPasswordStatus({ saving: false, message: "", error: "" });
  }, [open, user]);

  if (!open) return null;

  const initials = getInitials(user?.name, user?.email);

  const handleProfileChange = (field) => (e) => {
    setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validateProfile = () => {
    const next = {};
    if (!profileForm.name.trim()) next.name = "Enter your name.";
    if (!profileForm.email.trim()) {
      next.email = "Enter your email.";
    } else if (!/^\S+@\S+\.\S+$/.test(profileForm.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ saving: false, message: "", error: "" });
    if (!validateProfile()) return;

    setProfileStatus({ saving: true, message: "", error: "" });
    try {
      await updateProfile({ name: profileForm.name.trim(), email: profileForm.email.trim() });
      setProfileStatus({ saving: false, message: "Profile updated.", error: "" });
    } catch (err) {
      setProfileStatus({
        saving: false,
        message: "",
        error: err.response?.data?.message || "Couldn't update your profile. Try again.",
      });
    }
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validatePassword = () => {
    const next = {};
    if (!passwordForm.currentPassword) next.currentPassword = "Enter your current password.";
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      next.newPassword = "New password must be at least 6 characters.";
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      next.confirmPassword = "Passwords don't match.";
    }
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ saving: false, message: "", error: "" });
    if (!validatePassword()) return;

    setPasswordStatus({ saving: true, message: "", error: "" });
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStatus({ saving: false, message: "Password updated.", error: "" });
    } catch (err) {
      setPasswordStatus({
        saving: false,
        message: "",
        error: err.response?.data?.message || "Couldn't update your password. Try again.",
      });
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-card settings-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="settings-title">
            Account Settings
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="settings-identity">
          <span className="avatar-circle avatar-circle-lg">{initials}</span>
          <div className="settings-identity-text">
            <div className="settings-identity-name">{user?.name}</div>
            <div className="settings-identity-email">{user?.email}</div>
          </div>
        </div>

        <div className="settings-body">
          <section className="settings-section">
            <h3 className="settings-section-title">Profile</h3>
            <form onSubmit={handleProfileSubmit} noValidate>
              <div className="field">
                <label htmlFor="settings-name">Name</label>
                <input
                  id="settings-name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange("name")}
                  autoComplete="name"
                />
                {profileErrors.name && <div className="field-error">{profileErrors.name}</div>}
              </div>
              <div className="field">
                <label htmlFor="settings-email">Email</label>
                <input
                  id="settings-email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange("email")}
                  autoComplete="email"
                />
                {profileErrors.email && <div className="field-error">{profileErrors.email}</div>}
              </div>

              {profileStatus.error && <div className="field-error">{profileStatus.error}</div>}
              {profileStatus.message && (
                <div className="settings-success">{profileStatus.message}</div>
              )}

              <div className="settings-section-actions">
                <button type="submit" className="btn btn-primary" disabled={profileStatus.saving}>
                  {profileStatus.saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </section>

          <section className="settings-section">
            <h3 className="settings-section-title">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="field">
                <label htmlFor="current-password">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange("currentPassword")}
                  autoComplete="current-password"
                />
                {passwordErrors.currentPassword && (
                  <div className="field-error">{passwordErrors.currentPassword}</div>
                )}
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange("newPassword")}
                    autoComplete="new-password"
                  />
                  {passwordErrors.newPassword && (
                    <div className="field-error">{passwordErrors.newPassword}</div>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="confirm-password">Confirm new</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange("confirmPassword")}
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="field-error">{passwordErrors.confirmPassword}</div>
                  )}
                </div>
              </div>

              {passwordStatus.error && <div className="field-error">{passwordStatus.error}</div>}
              {passwordStatus.message && (
                <div className="settings-success">{passwordStatus.message}</div>
              )}

              <div className="settings-section-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordStatus.saving}
                >
                  {passwordStatus.saving ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          </section>

          <section className="settings-section settings-danger-zone">
            <h3 className="settings-section-title">Danger Zone</h3>
            <p className="confirm-text">
              Permanently delete your account and all your income and expense entries. This
              can't be undone.
            </p>
            <div className="settings-section-actions">
              <button type="button" className="btn btn-danger" onClick={onRequestDelete}>
                Delete account
              </button>
            </div>
          </section>
        </div>

        <div className="settings-logout-row">
          <button type="button" className="btn btn-ghost settings-logout-btn" onClick={onRequestLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
