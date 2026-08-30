import { Router } from "express";
import { getUsers, updateUser, setUserStatus, deleteUser } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/status", setUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
