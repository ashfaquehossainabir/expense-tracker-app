import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import Tab from "../models/Tab.js";

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  currency: user.currency,
});

// Kept in sync with the enum on the User model.
const SUPPORTED_CURRENCIES = ["BDT", "USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "CNY", "SGD"];

// Comma-separated list of emails (env: ADMIN_EMAILS) that should always be
// granted the admin role on registration, in addition to the very first
// account created in a fresh database.
const adminEmailAllowlist = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are all required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    // The first account in a fresh database, or any email on the ADMIN_EMAILS
    // allowlist, is automatically granted admin access so there's always a
    // way into the admin panel without manually editing the database.
    const isFirstUser = (await User.estimatedDocumentCount()) === 0;
    const role = isFirstUser || adminEmailAllowlist.includes(normalizedEmail) ? "admin" : "user";

    const user = await User.create({ name, email, password, role });
    await Tab.create({ user: user._id, name: "General", order: 0 });
    const token = signToken(user._id);

    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been deactivated. Contact an administrator." });
    }

    const token = signToken(user._id);
    res.status(200).json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ user: toPublicUser(req.user) });
};

// PATCH /api/auth/me — update name, email, and/or currency
export const updateProfile = async (req, res) => {
  try {
    const { name, email, currency } = req.body;

    if (!name && !email && !currency) {
      return res.status(400).json({ message: "Provide a name, email, or currency to update." });
    }

    if (currency && !SUPPORTED_CURRENCIES.includes(currency)) {
      return res.status(400).json({ message: "That currency isn't supported." });
    }

    const user = await User.findById(req.user._id);

    if (name) user.name = name;

    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({ message: "An account with that email already exists." });
      }
      user.email = email;
    }

    if (currency) user.currency = currency;

    await user.save();
    res.status(200).json({ user: toPublicUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: "Couldn't update profile", error: err.message });
  }
};

// PATCH /api/auth/me/password — change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are both required." });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ message: "Couldn't update password", error: err.message });
  }
};

// DELETE /api/auth/me — permanently delete account and all associated data
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Enter your password to confirm deletion." });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is incorrect." });
    }

    await Promise.all([
      Expense.deleteMany({ user: user._id }),
      Income.deleteMany({ user: user._id }),
      Tab.deleteMany({ user: user._id }),
    ]);
    await user.deleteOne();

    res.status(200).json({ message: "Account deleted." });
  } catch (err) {
    res.status(500).json({ message: "Couldn't delete account", error: err.message });
  }
};
