import Task from "../models/Task.js";
import Project from "../models/Project.js";
import ActivityLog from "../models/ActivityLog.js";

export const getDashboardStats = async (req, res) => {
  const isAdmin = req.user.role === "Admin";
  const taskMatch = isAdmin ? {} : { assignedTo: req.user._id };
  const projectQuery = isAdmin ? {} : { teamMembers: req.user._id };

  const [totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks, priorityStats, statusStats, monthlyTasks, recentActivities] =
    await Promise.all([
      Project.countDocuments(projectQuery),
      Task.countDocuments(taskMatch),
      Task.countDocuments({ ...taskMatch, status: "Completed" }),
      Task.countDocuments({ ...taskMatch, status: { $ne: "Completed" } }),
      Task.countDocuments({
        ...taskMatch,
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() }
      }),
      Task.aggregate([
        { $match: taskMatch },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: taskMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: taskMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      ActivityLog.find(isAdmin ? {} : { performedBy: req.user._id })
        .populate("performedBy", "name avatarUrl")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

  return res.json({
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    tasksByPriority: priorityStats.map((item) => ({ name: item._id, value: item.count })),
    tasksByStatus: statusStats.map((item) => ({ name: item._id, value: item.count })),
    monthlyTaskTrend: monthlyTasks.map((item) => ({ month: item._id, tasks: item.count })),
    recentActivities
  });
};
