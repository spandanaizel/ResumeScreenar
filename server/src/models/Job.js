const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Job title is required"], trim: true },
    companyName: { type: String, required: [true, "Company name is required"], trim: true },
    location: { type: String, default: "" },
    jobType: { type: String, default: "" },
    experienceLevel: { type: String, default: "" },
    description: { type: String, required: [true, "Job description is required"] },
    requiredSkills: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    minimumEducation: { type: String, default: "" },
    salaryRange: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
