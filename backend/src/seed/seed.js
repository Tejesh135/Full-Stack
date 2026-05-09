import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await Promise.all([Task.deleteMany({}), Project.deleteMany({}), User.deleteMany({})]);

  const password = await bcrypt.hash("Admin@123", 12);
  const [admin, member1, member2] = await User.create([
    {
      name: "Admin User",
      email: "admin@teamtask.com",
      password,
      role: "Admin"
    },
    {
      name: "Priya Sharma",
      email: "priya@teamtask.com",
      password,
      role: "Member"
    },
    {
      name: "Rahul Verma",
      email: "rahul@teamtask.com",
      password,
      role: "Member"
    }
  ]);

  const project = await Project.create({
    title: "Team Task Manager Platform",
    description: "Build and launch the internal task management platform.",
    status: "Active",
    createdBy: admin._id,
    teamMembers: [admin._id, member1._id, member2._id]
  });

  await Task.create([
    {
      title: "Design API contract",
      description: "Create API contract and implementation guidelines.",
      priority: "High",
      status: "In Progress",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignedTo: member1._id,
      projectId: project._id,
      createdBy: admin._id
    },
    {
      title: "Set up deployment pipeline",
      description: "Configure CI/CD and Railway deployments.",
      priority: "Medium",
      status: "Todo",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: member2._id,
      projectId: project._id,
      createdBy: admin._id
    }
  ]);

  console.log("Seed data inserted");
  process.exit(0);
};

seed();
