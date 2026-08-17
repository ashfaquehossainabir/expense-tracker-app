import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          loading ? (
            <div className="status-line">Checking your session…</div>
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          loading ? (
            <div className="status-line">Checking your session…</div>
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Register />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
