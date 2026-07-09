const pdfParse = require("pdf-parse");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { analyzeResumeWithJD } = require("../services/aiService");
const { extractEmail, extractCandidateName } = require("../utils/resumeParser");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/candidate/analyze
const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Resume file must be a PDF" });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "Resume file must be smaller than 5MB" });
    }

    const { jobDescription, jobTitle, companyName } = req.body;

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ message: "Job description is required" });
    }

    if (!jobTitle || typeof jobTitle !== "string" || !jobTitle.trim()) {
      return res.status(400).json({ message: "Job title is required" });
    }

    // Extract text from PDF buffer
    let resumeText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text || "";
    } catch (error) {
      console.error("PDF parsing failed:", error);
      return res.status(400).json({ message: "Could not read the uploaded PDF file" });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Could not extract any text from the uploaded PDF" });
    }

    const candidateEmail = extractEmail(resumeText);
    const candidateName = extractCandidateName(resumeText);

    let aiResult;
    try {
      aiResult = await analyzeResumeWithJD(resumeText, jobDescription, jobTitle);
    } catch (error) {
      console.error("AI analysis failed:", error);
      return res.status(502).json({ message: "AI analysis failed, please try again." });
    }

    const analysis = await ResumeAnalysis.create({
      userId: req.user._id,
      candidateName,
      candidateEmail,
      resumeFileName: req.file.originalname,
      resumeText,

      jobTitle,
      companyName: companyName || "",
      jobDescription,

      atsScore: aiResult.atsScore,
      overallMatchPercentage: aiResult.overallMatchPercentage,
      roleFit: aiResult.roleFit,
      summary: aiResult.summary,

      matchedSkills: aiResult.matchedSkills,
      missingSkills: aiResult.missingSkills,
      recommendedKeywords: aiResult.recommendedKeywords,

      technicalSkillScore: aiResult.technicalSkillScore,
      experienceScore: aiResult.experienceScore,
      projectScore: aiResult.projectScore,
      educationScore: aiResult.educationScore,
      keywordMatchScore: aiResult.keywordMatchScore,

      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      resumeImprovementSuggestions: aiResult.resumeImprovementSuggestions,

      interviewQuestions: aiResult.interviewQuestions,

      finalRecommendation: aiResult.finalRecommendation,
      rawAIResponse: aiResult,
    });

    return res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
};

// GET /api/candidate/analyses
const getAnalyses = async (req, res, next) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(analyses);
  } catch (error) {
    next(error);
  }
};

// GET /api/candidate/analyses/:id
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    return res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/candidate/analyses/:id
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    return res.status(200).json({ message: "Analysis deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// GET /api/candidate/skill-gaps
const getSkillGaps = async (req, res, next) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user._id }).select("missingSkills");

    const counts = {};
    analyses.forEach((analysis) => {
      (analysis.missingSkills || []).forEach((skill) => {
        const key = skill.trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });
    });

    const getPriority = (count) => {
      if (count >= 3) return "High";
      if (count === 2) return "Medium";
      return "Low";
    };

    const getSuggestedAction = (skill) =>
      `Build a small project or complete a focused course covering "${skill}" to close this gap.`;

    const skillGaps = Object.entries(counts)
      .map(([skill, count]) => ({
        skill,
        count,
        priority: getPriority(count),
        suggestedAction: getSuggestedAction(skill),
      }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json(skillGaps);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  getSkillGaps,
};
