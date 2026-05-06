// backend/controllers/applicationController.js
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Resume from "../models/Resume.js";

/** POST /api/applications — candidate applies for a job */
export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, attachResume } = req.body;
    if (!jobId) return res.status(400).json({ error: "jobId is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const existing = await JobApplication.findOne({ job: jobId, applicant: req.user.id });
    if (existing) return res.status(409).json({ error: "You have already applied for this job" });

    const application = await JobApplication.create({
      job: jobId,
      applicant: req.user.id,
      coverLetter: coverLetter?.trim() || undefined,
      resume: attachResume === true ? (await Resume.findOne({ user: req.user.id }).select("_id"))?._id || null : null,
    });

    return res.status(201).json(application);
  } catch (err) {
    console.error("[applicationController.applyForJob]", err);
    return res.status(500).json({ error: "An error occurred while submitting your application" });
  }
};

/** GET /api/applications/mine — candidate's own applications with job data */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.id })
      .populate("job")
      .sort({ createdAt: -1 })
      .select("-__v");
    return res.status(200).json(applications);
  } catch (err) {
    console.error("[applicationController.getMyApplications]", err);
    return res.status(500).json({ error: "An error occurred while fetching your applications" });
  }
};

/** GET /api/applications/job/:jobId — applications for employer's job */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not own this job posting" });
    }

    const applications = await JobApplication.find({ job: jobId })
      .sort({ createdAt: -1 })
      .select("-__v");

    const applicantIds = applications.map((a) => a.applicant);
    const profiles = await CandidateProfile.find({ user: { $in: applicantIds } }).select("-__v");
    const profileMap = Object.fromEntries(profiles.map((p) => [p.user.toString(), p]));

    const result = applications.map((app) => ({
      ...app.toObject(),
      candidateProfile: profileMap[app.applicant.toString()] || null,
      hasResume: app.resume != null,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("[applicationController.getApplicationsForJob]", err);
    return res.status(500).json({ error: "An error occurred while fetching applications" });
  }
};

/** GET /api/applications/counts — map of jobId → application count for employer's jobs */
export const getApplicationCounts = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    const counts = await JobApplication.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    const result = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    return res.status(200).json(result);
  } catch (err) {
    console.error("[applicationController.getApplicationCounts]", err);
    return res.status(500).json({ error: "An error occurred while fetching application counts" });
  }
};

/** PUT /api/applications/:id/status — employer updates application status */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewing", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const application = await JobApplication.findById(id).populate("job");
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not own this job posting" });
    }

    application.status = status;
    await application.save();

    return res.status(200).json(application);
  } catch (err) {
    console.error("[applicationController.updateApplicationStatus]", err);
    return res.status(500).json({ error: "An error occurred while updating the application status" });
  }
};
