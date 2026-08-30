import { Router } from "express";
import { getTabs, createTab, renameTab, deleteTab } from "../controllers/tabController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getTabs).post(createTab);
router.route("/:id").patch(renameTab).delete(deleteTab);

export default router;
