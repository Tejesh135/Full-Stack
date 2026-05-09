import api from "./api";

export const getProjects = async (params) => (await api.get("/projects", { params })).data;
export const getProjectById = async (id) => (await api.get(`/projects/${id}`)).data;
export const createProject = async (payload) => (await api.post("/projects", payload)).data;
export const updateProject = async (id, payload) => (await api.put(`/projects/${id}`, payload)).data;
export const deleteProject = async (id) => (await api.delete(`/projects/${id}`)).data;
