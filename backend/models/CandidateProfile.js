// backend/models/CandidateProfile.js
import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    institution:    { type: String, trim: true },
    degree:         { type: String, trim: true },
    fieldOfStudy:   { type: String, trim: true },
    graduationYear: { type: Number },
  },
  { _id: false }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    user:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName:          { type: String, required: true, trim: true },
    phone:             { type: String, required: true, trim: true },
    education:         { type: educationSchema, default: {} },
    yearsOfExperience: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("CandidateProfile", candidateProfileSchema);
