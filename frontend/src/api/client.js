import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Let callers/AuthContext decide what happens on a 401 (e.g. force logout)
// by attaching a listener rather than redirecting from deep inside the client.
let onUnauthorized = null;
export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default client;
