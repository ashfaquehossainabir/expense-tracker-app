import { Router } from "express";
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../controllers/incomeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getIncomes).post(createIncome);
router.route("/:id").get(getIncomeById).put(updateIncome).delete(deleteIncome);

export default router;
