import express from "express";
import { getUserById, getUsers, uploadAvatar } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("Admin"), getUsers);
router.put("/profile/avatar", uploadImage.single("avatar"), uploadAvatar);
router.get("/:id", getUserById);

export default router;
