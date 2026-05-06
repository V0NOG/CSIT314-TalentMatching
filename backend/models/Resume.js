// backend/models/Resume.js
import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  institution:    { type: String, trim: true },
  degree:         { type: String, trim: true },
  fieldOfStudy:   { type: String, trim: true },
  graduationYear: { type: Number },
  gpa:            { type: String, trim: true },
}, { _id: false });

const workExpSchema = new mongoose.Schema({
  jobTitle:    { type: String, trim: true },
  company:     { type: String, trim: true },
  location:    { type: String, trim: true },
  startDate:   { type: String, trim: true },
  endDate:     { type: String, trim: true },
  current:     { type: Boolean, default: false },
  description: { type: String, trim: true },
}, { _id: false });

const certSchema = new mongoose.Schema({
  name:   { type: String, trim: true },
  issuer: { type: String, trim: true },
  year:   { type: String, trim: true },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name:        { type: String, trim: true },
  description: { type: String, trim: true },
  url:         { type: String, trim: true },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  template:     { type: String, enum: ["classic", "modern", "minimal"], default: "classic" },
  personalInfo: {
    fullName:  { type: String, trim: true, default: "" },
    email:     { type: String, trim: true, default: "" },
    phone:     { type: String, trim: true, default: "" },
    location:  { type: String, trim: true, default: "" },
    website:   { type: String, trim: true, default: "" },
    linkedin:  { type: String, trim: true, default: "" },
  },
  summary:        { type: String, trim: true, default: "" },
  education:      [educationSchema],
  workExperience: [workExpSchema],
  skills:         [{ type: String, trim: true }],
  certifications: [certSchema],
  projects:       [projectSchema],
}, { timestamps: true });

export default mongoose.model("Resume", resumeSchema);
