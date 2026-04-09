// backend/models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employer:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:              { type: String, required: true, trim: true },
    description:        { type: String, required: true, trim: true },
    location:           { type: String, required: true, trim: true },
    status:             { type: String, enum: ["draft", "active", "closed"], default: "draft" },
    workMode:           { type: String, enum: ["Remote", "On-site", "Hybrid"], required: true },
    requiredEducation:  { type: String, required: true, trim: true },
    requiredSkills:     { type: [String], required: true },
    yearsOfExperience:  { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
