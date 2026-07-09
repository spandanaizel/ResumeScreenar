const mongoose = require("mongoose");

const dailyPlanItemSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    topic: { type: String, default: "" },
    tasks: { type: [String], default: [] },
    resources: { type: [String], default: [] },
    expectedOutcome: { type: String, default: "" },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeAnalysis",
      required: true,
    },
    duration: { type: String, required: true },
    goal: { type: String, default: "" },
    dailyPlan: { type: [dailyPlanItemSchema], default: [] },
    finalProjectSuggestion: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
