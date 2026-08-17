import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense-tracker";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

if (!process.env.JWT_SECRET) {
  console.warn(
    "Warning: JWT_SECRET is not set in .env. Using an insecure default for local dev only."
  );
  process.env.JWT_SECRET = "dev-only-insecure-secret-change-me";
}

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
