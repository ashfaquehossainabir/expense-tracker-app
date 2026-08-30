import client from "./client";

export const fetchIncomes = (tabId) =>
  client.get("/income", { params: tabId ? { tab: tabId } : {} }).then((res) => res.data);

export const createIncome = (payload) =>
  client.post("/income", payload).then((res) => res.data);

export const updateIncome = (id, payload) =>
  client.put(`/income/${id}`, payload).then((res) => res.data);

export const deleteIncome = (id) => client.delete(`/income/${id}`).then((res) => res.data);
