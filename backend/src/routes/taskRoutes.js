import express from "express";
import { body } from "express-validator";
import {
  addTaskComment,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post(
  "/",
  authorizeRoles("Admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("priority").optional().isIn(["Low", "Medium", "High"]),
    body("status").optional().isIn(["Todo", "In Progress", "Completed"]),
    body("dueDate").notEmpty().isISO8601().withMessage("Valid due date is required"),
    body("assignedTo").notEmpty().withMessage("assignedTo is required"),
    body("projectId").notEmpty().withMessage("projectId is required")
  ],
  validateRequest,
  createTask
);

router.put(
  "/:id",
  [
    body("title").optional().trim().notEmpty(),
    body("description").optional().trim().notEmpty(),
    body("priority").optional().isIn(["Low", "Medium", "High"]),
    body("status").optional().isIn(["Todo", "In Progress", "Completed"]),
    body("dueDate").optional().isISO8601(),
    body("assignedTo").optional().notEmpty(),
    body("projectId").optional().notEmpty()
  ],
  validateRequest,
  updateTask
);
router.post("/:id/comments", [body("message").trim().notEmpty().withMessage("Comment is required")], validateRequest, addTaskComment);
router.delete("/:id", authorizeRoles("Admin"), deleteTask);

export default router;
