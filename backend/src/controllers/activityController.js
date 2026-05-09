import ActivityLog from "../models/ActivityLog.js";
import { parsePagination } from "../utils/pagination.js";

export const getActivities = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const query = req.user.role === "Admin" ? {} : { performedBy: req.user._id };

  const [total, data] = await Promise.all([
    ActivityLog.countDocuments(query),
    ActivityLog.find(query)
      .populate("performedBy", "name email role avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
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
