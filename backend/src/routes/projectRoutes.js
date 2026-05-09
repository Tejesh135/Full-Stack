import express from "express";
import { body } from "express-validator";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.use(protect);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post(
  "/",
  authorizeRoles("Admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("status").optional().isIn(["Active", "Completed", "On Hold"]),
    body("teamMembers").optional().isArray()
  ],
  validateRequest,
  createProject
);

router.put(
  "/:id",
  authorizeRoles("Admin"),
  [
    body("title").optional().trim().notEmpty(),
    body("description").optional().trim().notEmpty(),
    body("status").optional().isIn(["Active", "Completed", "On Hold"]),
    body("teamMembers").optional().isArray()
  ],
  validateRequest,
  updateProject
);

router.delete("/:id", authorizeRoles("Admin"), deleteProject);

export default router;
