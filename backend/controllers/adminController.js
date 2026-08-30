import mongoose from "mongoose";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Tab from "../models/Tab.js";

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// GET /api/admin/users
// Returns every user account along with a quick count of their expense,
// income, and tab entries so the admin table has useful context at a glance.
export const getUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "expenses",
          localField: "_id",
          foreignField: "user",
          pipeline: [{ $count: "count" }],
          as: "expenseStats",
        },
      },
      {
        $lookup: {
          from: "incomes",
          localField: "_id",
          foreignField: "user",
          pipeline: [{ $count: "count" }],
          as: "incomeStats",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          expenseCount: { $ifNull: [{ $first: "$expenseStats.count" }, 0] },
          incomeCount: { $ifNull: [{ $first: "$incomeStats.count" }, 0] },
        },
      },
    ]);

    res.status(200).json({
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        expenseCount: u.expenseCount,
        incomeCount: u.incomeCount,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Couldn't load users", error: err.message });
  }
};

const findEditableUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid user id." });
    return null;
  }

  if (id === String(req.user._id)) {
    res
      .status(400)
      .json({ message: "Use Account Settings to manage your own profile from the admin panel." });
    return null;
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return null;
  }
  return user;
};

// PATCH /api/admin/users/:id — edit another user's name, email, or role
export const updateUser = async (req, res) => {
  try {
    const user = await findEditableUser(req, res);
    if (!user) return;

    const { name, email, role } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name can't be empty." });
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email can't be empty." });
      }
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({ message: "An account with that email already exists." });
        }
        user.email = normalizedEmail;
      }
    }

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'user' or 'admin'." });
      }
      user.role = role;
    }

    await user.save();
    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: "Couldn't update user", error: err.message });
  }
};

// PATCH /api/admin/users/:id/status — activate or deactivate an account
export const setUserStatus = async (req, res) => {
  try {
    const user = await findEditableUser(req, res);
    if (!user) return;

    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be true or false." });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Couldn't update account status", error: err.message });
  }
};

// DELETE /api/admin/users/:id — permanently delete a user and their data
export const deleteUser = async (req, res) => {
  try {
    const user = await findEditableUser(req, res);
    if (!user) return;

    await Promise.all([
      Expense.deleteMany({ user: user._id }),
      Income.deleteMany({ user: user._id }),
      Tab.deleteMany({ user: user._id }),
    ]);
    await user.deleteOne();

    res.status(200).json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ message: "Couldn't delete user", error: err.message });
  }
};
