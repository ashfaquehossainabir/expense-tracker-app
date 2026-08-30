import client from "./client";

export const fetchTabs = () => client.get("/tabs").then((res) => res.data);

export const createTab = (name) => client.post("/tabs", { name }).then((res) => res.data);

export const renameTab = (id, name) =>
  client.patch(`/tabs/${id}`, { name }).then((res) => res.data);

export const deleteTab = (id) => client.delete(`/tabs/${id}`).then((res) => res.data);
