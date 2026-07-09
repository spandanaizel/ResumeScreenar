const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    reason: { type: String, default: "" },
    expectedAnswerHint: { type: String, default: "" },
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    candidateName: { type: String, default: "" },
    candidateEmail: { type: String, default: "" },
    resumeFileName: { type: String, default: "" },
    resumeText: { type: String, default: "" },

    jobTitle: { type: String, default: "" },
    companyName: { type: String, default: "" },
    jobDescription: { type: String, default: "" },

    atsScore: { type: Number, default: 0 },
    overallMatchPercentage: { type: Number, default: 0 },
    roleFit: { type: String, default: "" },
    summary: { type: String, default: "" },

    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    recommendedKeywords: { type: [String], default: [] },

    technicalSkillScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    projectScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 0 },
    keywordMatchScore: { type: Number, default: 0 },

    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    resumeImprovementSuggestions: { type: [String], default: [] },

    interviewQuestions: { type: [interviewQuestionSchema], default: [] },

    finalRecommendation: { type: String, default: "" },
    rawAIResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
