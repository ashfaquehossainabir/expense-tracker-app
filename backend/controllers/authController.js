import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are all required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const user = await User.create({ name, email, password });
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
