import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Enter your email.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await login(form);
    setSubmitting(false);
    if (ok) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-eyebrow">Ledger</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to see your expense register.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              autoFocus
              autoComplete="email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          {authError && <div className="field-error auth-error">{authError}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
