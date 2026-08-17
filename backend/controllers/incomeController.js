import Income from "../models/Income.js";

// GET /api/income
export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });
    res.status(200).json(incomes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch income", error: err.message });
  }
};

// GET /api/income/:id
export const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ message: "Income entry not found" });
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch income entry", error: err.message });
  }
};

// POST /api/income
export const createIncome = async (req, res) => {
  try {
    const { title, amount, source, date, note } = req.body;
    const income = await Income.create({
      title,
      amount,
      source,
      date,
      note,
      user: req.user._id,
    });
    res.status(201).json(income);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: err.message });
    }
    res.status(500).json({ message: "Failed to create income entry", error: err.message });
  }
};

// PUT /api/income/:id
export const updateIncome = async (req, res) => {
  try {
    const { title, amount, source, date, note } = req.body;
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, amount, source, date, note },
      { new: true, runValidators: true }
    );
    if (!income) return res.status(404).json({ message: "Income entry not found" });
    res.status(200).json(income);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: err.message });
    }
    res.status(500).json({ message: "Failed to update income entry", error: err.message });
  }
};

// DELETE /api/income/:id
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ message: "Income entry not found" });
    res.status(200).json({ message: "Income entry deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete income entry", error: err.message });
  }
};
