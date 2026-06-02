// backend/models/JobApplication.js
import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job:         { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true },
    applicant:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:      { type: String, enum: ["pending", "reviewing", "accepted", "rejected"], default: "pending" },
    coverLetter: { type: String, trim: true },
    resume:      { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.model("JobApplication", jobApplicationSchema);
