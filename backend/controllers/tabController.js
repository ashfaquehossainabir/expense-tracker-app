import mongoose from "mongoose";
import Tab from "../models/Tab.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

const DEFAULT_TAB_NAME = "General";

// Accounts created before tabs existed won't have any Tab documents yet, and any
// expenses/income they already logged won't have a `tab` set. The first time such a
// user asks for their tabs, quietly create a default tab and move their orphaned
// entries into it, so nothing they've already logged goes missing.
const ensureDefaultTab = async (userId) => {
  const defaultTab = await Tab.create({ user: userId, name: DEFAULT_TAB_NAME, order: 0 });
  await Promise.all([
    Expense.updateMany(
      { user: userId, tab: { $in: [null, undefined] } },
      { $set: { tab: defaultTab._id } }
    ),
    Income.updateMany(
      { user: userId, tab: { $in: [null, undefined] } },
      { $set: { tab: defaultTab._id } }
    ),
  ]);
  return defaultTab;
};

const withCounts = async (tabs, userId) => {
  const tabIds = tabs.map((t) => t._id);
  const [expenseCounts, incomeCounts] = await Promise.all([
    Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), tab: { $in: tabIds } } },
      { $group: { _id: "$tab", count: { $sum: 1 } } },
    ]),
    Income.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), tab: { $in: tabIds } } },
      { $group: { _id: "$tab", count: { $sum: 1 } } },
    ]),
  ]);

  const expenseMap = new Map(expenseCounts.map((c) => [String(c._id), c.count]));
  const incomeMap = new Map(incomeCounts.map((c) => [String(c._id), c.count]));

  return tabs.map((tab) => ({
    ...tab,
    expenseCount: expenseMap.get(String(tab._id)) || 0,
    incomeCount: incomeMap.get(String(tab._id)) || 0,
  }));
};

// GET /api/tabs
export const getTabs = async (req, res) => {
  try {
    let tabs = await Tab.find({ user: req.user._id }).sort({ order: 1, createdAt: 1 }).lean();

    if (tabs.length === 0) {
      const defaultTab = await ensureDefaultTab(req.user._id);
      tabs = [defaultTab.toObject()];
    }

    const withEntryCounts = await withCounts(tabs, req.user._id);
    res.status(200).json(withEntryCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tabs", error: err.message });
  }
};

// POST /api/tabs
export const createTab = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Enter a name for the tab." });
    }

    const highest = await Tab.findOne({ user: req.user._id }).sort({ order: -1 });
    const tab = await Tab.create({
      user: req.user._id,
      name: name.trim(),
      order: highest ? highest.order + 1 : 0,
    });

    res.status(201).json({ ...tab.toObject(), expenseCount: 0, incomeCount: 0 });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already have a tab with that name." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: "Failed to create tab", error: err.message });
  }
};

// PATCH /api/tabs/:id — rename
export const renameTab = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Enter a name for the tab." });
    }

    const tab = await Tab.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    if (!tab) return res.status(404).json({ message: "Tab not found" });

    const [expenseCount, incomeCount] = await Promise.all([
      Expense.countDocuments({ user: req.user._id, tab: tab._id }),
      Income.countDocuments({ user: req.user._id, tab: tab._id }),
    ]);

    res.status(200).json({ ...tab.toObject(), expenseCount, incomeCount });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already have a tab with that name." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: "Failed to rename tab", error: err.message });
  }
};

// DELETE /api/tabs/:id — deletes the tab and every expense/income logged under it
export const deleteTab = async (req, res) => {
  try {
    const tab = await Tab.findOne({ _id: req.params.id, user: req.user._id });
    if (!tab) return res.status(404).json({ message: "Tab not found" });

    await Promise.all([
      Expense.deleteMany({ user: req.user._id, tab: tab._id }),
      Income.deleteMany({ user: req.user._id, tab: tab._id }),
    ]);
    await tab.deleteOne();

    res.status(200).json({ message: "Tab deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete tab", error: err.message });
  }
};
