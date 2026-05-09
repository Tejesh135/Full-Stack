import api from "./api";

export const getUsers = async (params) => (await api.get("/users", { params })).data;
export const getUserById = async (id) => (await api.get(`/users/${id}`)).data;
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return (await api.put("/users/profile/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
};
