import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { parsePagination } from "../utils/pagination.js";
import logActivity from "../utils/logActivity.js";

const taskAccessQuery = (user) => {
  if (user.role === "Admin") return {};
  return { assignedTo: user._id };
};

export const getTasks = async (req, res) => {
  const { status, priority, dueDate, assignedTo, search, projectId } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const query = { ...taskAccessQuery(req.user) };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo && req.user.role === "Admin") query.assignedTo = assignedTo;
  if (dueDate) query.dueDate = { $lte: new Date(dueDate) };
  if (projectId) query.projectId = projectId;
  if (search) {
    query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  }

  const [total, data] = await Promise.all([
    Task.countDocuments(query),
    Task.find(query)
      .populate("assignedTo", "name email role avatarUrl")
      .populate("projectId", "title status")
      .populate("createdBy", "name email avatarUrl")
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

export const createTask = async (req, res) => {
  const { title, description, priority, status, dueDate, assignedTo, projectId } = req.body;
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const task = await Task.create({
    title,
    description,
    priority,
    status: status || "Todo",
    dueDate,
    assignedTo,
    projectId,
    createdBy: req.user._id
  });

  await logActivity({
    action: "CREATE_TASK",
    entityType: "Task",
    entityId: task._id,
    message: `${req.user.name} created task "${task.title}"`,
    performedBy: req.user._id
  });

  return res.status(201).json(task);
};

export const getTaskById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid task id" });
  }

  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email role avatarUrl")
    .populate("projectId", "title status teamMembers")
    .populate("createdBy", "name email avatarUrl")
    .populate("comments.user", "name avatarUrl");

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (req.user.role !== "Admin" && task.assignedTo._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(task);
};

export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (req.user.role === "Member") {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    task.status = req.body.status ?? task.status;
    await task.save();
    await logActivity({
      action: "UPDATE_TASK_STATUS",
      entityType: "Task",
      entityId: task._id,
      message: `${req.user.name} updated task status to "${task.status}"`,
      performedBy: req.user._id
    });
    return res.json(task);
  }

  const fields = ["title", "description", "priority", "status", "dueDate", "assignedTo", "projectId"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });
  await task.save();
  await logActivity({
    action: "UPDATE_TASK",
    entityType: "Task",
    entityId: task._id,
    message: `${req.user.name} updated task "${task.title}"`,
    performedBy: req.user._id
  });
  return res.json(task);
};

export const addTaskComment = async (req, res) => {
  const { message } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (req.user.role !== "Admin" && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  task.comments.push({
    message,
    user: req.user._id
  });
  await task.save();
  await task.populate("comments.user", "name avatarUrl");

  await logActivity({
    action: "ADD_TASK_COMMENT",
    entityType: "Comment",
    entityId: task._id,
    message: `${req.user.name} commented on task "${task.title}"`,
    performedBy: req.user._id
  });

  return res.status(201).json(task.comments[task.comments.length - 1]);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  await task.deleteOne();
  await logActivity({
    action: "DELETE_TASK",
    entityType: "Task",
    entityId: task._id,
    message: `${req.user.name} deleted task "${task.title}"`,
    performedBy: req.user._id
  });
  return res.json({ message: "Task deleted successfully" });
};
