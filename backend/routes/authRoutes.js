import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfile);
router.patch("/me/password", protect, changePassword);
router.delete("/me", protect, deleteAccount);

export default router;
