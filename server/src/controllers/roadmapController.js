const ResumeAnalysis = require("../models/ResumeAnalysis");
const Roadmap = require("../models/Roadmap");
const { generateRoadmap, ALLOWED_ROADMAP_DURATIONS } = require("../services/aiService");

// POST /api/candidate/roadmap/:analysisId
const createRoadmap = async (req, res, next) => {
  try {
    const { duration } = req.body;

    if (!duration || !ALLOWED_ROADMAP_DURATIONS.includes(duration)) {
      return res.status(400).json({
        message: `Duration must be one of: ${ALLOWED_ROADMAP_DURATIONS.join(", ")}`,
      });
    }

    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.analysisId,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysisData = {
      jobTitle: analysis.jobTitle,
      companyName: analysis.companyName,
      jobDescription: analysis.jobDescription,
      atsScore: analysis.atsScore,
      overallMatchPercentage: analysis.overallMatchPercentage,
      roleFit: analysis.roleFit,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      recommendedKeywords: analysis.recommendedKeywords,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      resumeImprovementSuggestions: analysis.resumeImprovementSuggestions,
    };

    let roadmapData;
    try {
      roadmapData = await generateRoadmap(analysisData, duration);
    } catch (error) {
      console.error("Roadmap generation failed:", error);
      return res.status(502).json({ message: "Roadmap generation failed, please try again." });
    }

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      analysisId: analysis._id,
      duration: roadmapData.duration,
      goal: roadmapData.goal,
      dailyPlan: roadmapData.dailyPlan,
      finalProjectSuggestion: roadmapData.finalProjectSuggestion,
    });

    return res.status(201).json(roadmap);
  } catch (error) {
    next(error);
  }
};

// GET /api/candidate/roadmaps
const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .populate("analysisId", "jobTitle companyName")
      .sort({ createdAt: -1 });

    return res.status(200).json(roadmaps);
  } catch (error) {
    next(error);
  }
};

// GET /api/candidate/roadmaps/:id
const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("analysisId", "jobTitle companyName");

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    return res.status(200).json(roadmap);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/candidate/roadmaps/:id
const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    return res.status(200).json({ message: "Roadmap deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoadmap, getRoadmaps, getRoadmapById, deleteRoadmap };
