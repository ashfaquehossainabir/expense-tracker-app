import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 80,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      enum: ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"],
      default: "Other",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);
