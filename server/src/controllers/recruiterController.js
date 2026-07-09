const pdfParse = require("pdf-parse");
const Job = require("../models/Job");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { analyzeResumeWithJD } = require("../services/aiService");
const { extractEmail, extractCandidateName } = require("../utils/resumeParser");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BULK_FILES = 10;

const normalizeSkillsField = (value) => {
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

// POST /api/recruiter/jobs
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      location,
      jobType,
      experienceLevel,
      description,
      requiredSkills,
      preferredSkills,
      minimumEducation,
      salaryRange,
    } = req.body;

    if (!title || !companyName || !description) {
      return res
        .status(400)
        .json({ message: "Job title, company name, and description are required" });
    }

    const job = await Job.create({
      title,
      companyName,
      location: location || "",
      jobType: jobType || "",
      experienceLevel: experienceLevel || "",
      description,
      requiredSkills: normalizeSkillsField(requiredSkills),
      preferredSkills: normalizeSkillsField(preferredSkills),
      minimumEducation: minimumEducation || "",
      salaryRange: salaryRange || "",
      createdBy: req.user._id,
    });

    return res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// GET /api/recruiter/jobs
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

// GET /api/recruiter/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

// PUT /api/recruiter/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const {
      title,
      companyName,
      location,
      jobType,
      experienceLevel,
      description,
      requiredSkills,
      preferredSkills,
      minimumEducation,
      salaryRange,
    } = req.body;

    if (title !== undefined) job.title = title;
    if (companyName !== undefined) job.companyName = companyName;
    if (location !== undefined) job.location = location;
    if (jobType !== undefined) job.jobType = jobType;
    if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
    if (description !== undefined) job.description = description;
    if (requiredSkills !== undefined) job.requiredSkills = normalizeSkillsField(requiredSkills);
    if (preferredSkills !== undefined) job.preferredSkills = normalizeSkillsField(preferredSkills);
    if (minimumEducation !== undefined) job.minimumEducation = minimumEducation;
    if (salaryRange !== undefined) job.salaryRange = salaryRange;

    await job.save();

    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/recruiter/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await ResumeAnalysis.deleteMany({ jobId: job._id });

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /api/recruiter/jobs/:jobId/analyze-resumes
const analyzeResumesForJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one resume file is required" });
    }
    if (files.length > MAX_BULK_FILES) {
      return res.status(400).json({ message: `You can upload at most ${MAX_BULK_FILES} resumes at once` });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        if (file.mimetype !== "application/pdf") {
          errors.push({ fileName: file.originalname, message: "Only PDF files are allowed" });
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push({ fileName: file.originalname, message: "File must be smaller than 5MB" });
          continue;
        }

        let resumeText;
        try {
          const pdfData = await pdfParse(file.buffer);
          resumeText = pdfData.text || "";
        } catch (error) {
          errors.push({ fileName: file.originalname, message: "Could not read the PDF file" });
          continue;
        }

        if (!resumeText.trim()) {
          errors.push({ fileName: file.originalname, message: "Could not extract any text from the PDF" });
          continue;
        }

        const candidateEmail = extractEmail(resumeText);
        const candidateName = extractCandidateName(resumeText);

        const aiResult = await analyzeResumeWithJD(resumeText, job.description, job.title);

        const analysis = await ResumeAnalysis.create({
          userId: req.user._id,
          jobId: job._id,
          candidateName,
          candidateEmail,
          resumeFileName: file.originalname,
          resumeText,

          jobTitle: job.title,
          companyName: job.companyName,
          jobDescription: job.description,

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

        results.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze resume "${file.originalname}":`, error);
        errors.push({ fileName: file.originalname, message: "AI analysis failed for this resume" });
      }
    }

    return res.status(201).json({ analyzed: results, failed: errors });
  } catch (error) {
    next(error);
  }
};

// GET /api/recruiter/jobs/:jobId/rankings
const getRankings = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const { minScore, maxScore, roleFit, sortBy } = req.query;

    const query = { jobId: job._id };

    if (minScore !== undefined || maxScore !== undefined) {
      query.overallMatchPercentage = {};
      if (minScore !== undefined) query.overallMatchPercentage.$gte = Number(minScore);
      if (maxScore !== undefined) query.overallMatchPercentage.$lte = Number(maxScore);
    }

    if (roleFit) {
      query.roleFit = roleFit;
    }

    let sort = { overallMatchPercentage: -1 };
    if (sortBy === "latest") sort = { createdAt: -1 };
    if (sortBy === "highestMatch") sort = { overallMatchPercentage: -1 };

    const rankings = await ResumeAnalysis.find(query).sort(sort);

    return res.status(200).json(rankings);
  } catch (error) {
    next(error);
  }
};

// GET /api/recruiter/analyses/:id
const getRecruiterAnalysisById = async (req, res, next) => {
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

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  analyzeResumesForJob,
  getRankings,
  getRecruiterAnalysisById,
};
