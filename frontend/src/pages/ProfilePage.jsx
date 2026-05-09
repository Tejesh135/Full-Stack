import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { uploadAvatar } from "../services/userService";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const avatarUrl = user?.avatarUrl ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${user.avatarUrl}` : "";

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const response = await uploadAvatar(file);
      updateUser(response.user);
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <h2 className="mb-4 text-xl font-semibold">Profile</h2>
      <div className="mb-4 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border dark:border-slate-700">
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-lg font-semibold dark:bg-slate-700">
              {user?.name?.[0] || "U"}
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm text-white">
          {uploading ? "Uploading..." : "Upload Profile Image"}
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </label>
      </div>
      <div className="space-y-3 text-sm">
        <p>
          <span className="font-medium">Name:</span> {user?.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-medium">Role:</span> {user?.role}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
