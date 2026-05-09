import api from "./api";

export const getTasks = async (params) => (await api.get("/tasks", { params })).data;
export const getTaskById = async (id) => (await api.get(`/tasks/${id}`)).data;
export const createTask = async (payload) => (await api.post("/tasks", payload)).data;
export const updateTask = async (id, payload) => (await api.put(`/tasks/${id}`, payload)).data;
export const deleteTask = async (id) => (await api.delete(`/tasks/${id}`)).data;
export const addTaskComment = async (id, payload) => (await api.post(`/tasks/${id}/comments`, payload)).data;
