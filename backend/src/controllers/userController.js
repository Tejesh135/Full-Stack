import mongoose from "mongoose";
import User from "../models/User.js";
import { parsePagination } from "../utils/pagination.js";
import logActivity from "../utils/logActivity.js";

const toPublicUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl
});

export const getUsers = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search?.trim();
  const query = {};
  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }

  const [total, data] = await Promise.all([
    User.countDocuments(query),
    User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);

  return res.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
};

export const getUserById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (req.user.role !== "Admin" && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image file" });
  }
  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl },
    { new: true, runValidators: true }
  ).select("-password");

  await logActivity({
    action: "UPLOAD_AVATAR",
    entityType: "User",
    entityId: user._id,
    message: `${user.name} updated profile image`,
    performedBy: user._id
  });

  return res.json({
    message: "Profile image updated",
    user: toPublicUser(user)
  });
};
