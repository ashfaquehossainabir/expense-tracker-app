import client from "./client";

export const fetchExpenses = (tabId) =>
  client.get("/expenses", { params: tabId ? { tab: tabId } : {} }).then((res) => res.data);

export const createExpense = (payload) =>
  client.post("/expenses", payload).then((res) => res.data);

export const updateExpense = (id, payload) =>
  client.put(`/expenses/${id}`, payload).then((res) => res.data);

export const deleteExpense = (id) =>
  client.delete(`/expenses/${id}`).then((res) => res.data);
