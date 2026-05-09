import api from "./api";

export const getActivities = async (params) => (await api.get("/activity", { params })).data;
