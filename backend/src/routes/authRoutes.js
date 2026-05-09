import express from "express";
import { body } from "express-validator";
import { getProfile, login, signup } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

const passwordRules = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must include at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must include at least one lowercase letter")
  .matches(/\d/)
  .withMessage("Password must include at least one number")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must include at least one special character");

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    passwordRules,
    body("role").optional().isIn(["Admin", "Member"]).withMessage("Role must be Admin or Member")
  ],
  validateRequest,
  signup
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty()],
  validateRequest,
  login
);

router.get("/profile", protect, getProfile);

export default router;
