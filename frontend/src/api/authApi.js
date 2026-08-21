import client from "./client";

export const registerUser = (payload) =>
  client.post("/auth/register", payload).then((res) => res.data);

export const loginUser = (payload) =>
  client.post("/auth/login", payload).then((res) => res.data);

export const fetchMe = () => client.get("/auth/me").then((res) => res.data);

export const updateProfile = (payload) =>
  client.patch("/auth/me", payload).then((res) => res.data);

export const changePassword = (payload) =>
  client.patch("/auth/me/password", payload).then((res) => res.data);

export const deleteAccount = (payload) =>
  client.delete("/auth/me", { data: payload }).then((res) => res.data);
