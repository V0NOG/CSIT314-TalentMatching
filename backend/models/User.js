// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, index: true },
    password:  { type: String, required: true },

    // Role determines which workflow the user sees
    role: {
      type: String,
      enum: ["candidate", "employer"],
      required: true,
    },

    // Token invalidation — bump to force logout on all devices
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
