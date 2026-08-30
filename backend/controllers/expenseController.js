import Expense from "../models/Expense.js";
import Tab from "../models/Tab.js";

// GET /api/expenses?tab=<tabId>
export const getExpenses = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.tab) filter.tab = req.query.tab;

    const expenses = await Expense.find(filter).sort({
      date: -1,
      createdAt: -1,
    });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses", error: err.message });
  }
};

// GET /api/expenses/:id
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expense", error: err.message });
  }
};

// POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, note, tab } = req.body;

    if (!tab) {
      return res.status(400).json({ message: "A tab is required to create an expense." });
    }
    const ownedTab = await Tab.findOne({ _id: tab, user: req.user._id });
    if (!ownedTab) {
      return res.status(404).json({ message: "Tab not found" });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      note,
      tab,
      user: req.user._id,
    });
    res.status(201).json(expense);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: err.message });
    }
    res.status(500).json({ message: "Failed to create expense", error: err.message });
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, amount, category, date, note },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: err.message });
    }
    res.status(500).json({ message: "Failed to update expense", error: err.message });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ message: "Expense deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense", error: err.message });
  }
};
