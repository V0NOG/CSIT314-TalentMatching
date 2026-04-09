// backend/models/EmployerProfile.js
import mongoose from "mongoose";

const employerProfileSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    industry:    { type: String, trim: true },
    location:    { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("EmployerProfile", employerProfileSchema);
