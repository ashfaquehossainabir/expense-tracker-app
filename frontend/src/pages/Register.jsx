import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.email.trim()) next.email = "Enter your email.";
    if (!form.password || form.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    if (form.confirm !== form.password) {
      next.confirm = "Passwords don't match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await register({ name: form.name, email: form.email, password: form.password });
    setSubmitting(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-eyebrow">Ledger</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start keeping your own expense register.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Enter your name"
              autoFocus
              autoComplete="name"
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirm</label>
              <input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange("confirm")}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
            </div>
          </div>

          {authError && <div className="field-error auth-error">{authError}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
