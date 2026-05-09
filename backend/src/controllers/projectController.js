import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { parsePagination } from "../utils/pagination.js";
import logActivity from "../utils/logActivity.js";

const canViewProject = (project, user) => {
  if (user.role === "Admin") return true;
  return project.teamMembers.some((memberId) => memberId.toString() === user._id.toString());
};

export const getProjects = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search?.trim();
  const baseQuery = req.user.role === "Admin" ? {} : { teamMembers: req.user._id };
  if (search) {
    baseQuery.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  }

  const [total, data] = await Promise.all([
    Project.countDocuments(baseQuery),
    Project.find(baseQuery)
      .populate("createdBy", "name email avatarUrl")
      .populate("teamMembers", "name email role avatarUrl")
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

export const createProject = async (req, res) => {
  const { title, description, status, teamMembers = [] } = req.body;
  const uniqueTeamMembers = [...new Set([...teamMembers, req.user._id.toString()])];

  const project = await Project.create({
    title,
    description,
    status: status || "Active",
    createdBy: req.user._id,
    teamMembers: uniqueTeamMembers
  });

  await logActivity({
    action: "CREATE_PROJECT",
    entityType: "Project",
    entityId: project._id,
    message: `${req.user.name} created project "${project.title}"`,
    performedBy: req.user._id
  });

  return res.status(201).json(project);
};

export const getProjectById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const project = await Project.findById(req.params.id)
    .populate("createdBy", "name email avatarUrl")
    .populate("teamMembers", "name email role avatarUrl");

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!canViewProject(project, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(project);
};

export const updateProject = async (req, res) => {
  const { title, description, status, teamMembers } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  project.title = title ?? project.title;
  project.description = description ?? project.description;
  project.status = status ?? project.status;
  if (Array.isArray(teamMembers)) {
    project.teamMembers = [...new Set(teamMembers)];
  }

  await project.save();
  await logActivity({
    action: "UPDATE_PROJECT",
    entityType: "Project",
    entityId: project._id,
    message: `${req.user.name} updated project "${project.title}"`,
    performedBy: req.user._id
  });
  return res.json(project);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();
  await logActivity({
    action: "DELETE_PROJECT",
    entityType: "Project",
    entityId: project._id,
    message: `${req.user.name} deleted project "${project.title}"`,
    performedBy: req.user._id
  });

  return res.json({ message: "Project deleted successfully" });
};
