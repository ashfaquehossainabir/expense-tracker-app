import client from "./client";

export const registerUser = (payload) =>
  client.post("/auth/register", payload).then((res) => res.data);

export const loginUser = (payload) =>
  client.post("/auth/login", payload).then((res) => res.data);

export const fetchMe = () => client.get("/auth/me").then((res) => res.data);
