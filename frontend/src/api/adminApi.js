import client from "./client";

export const fetchAllUsers = () =>
  client.get("/admin/users").then((res) => res.data.users);

export const updateUserByAdmin = (id, payload) =>
  client.patch(`/admin/users/${id}`, payload).then((res) => res.data.user);

export const setUserActiveStatus = (id, isActive) =>
  client.patch(`/admin/users/${id}/status`, { isActive }).then((res) => res.data.user);

export const deleteUserByAdmin = (id) =>
  client.delete(`/admin/users/${id}`).then((res) => res.data);
