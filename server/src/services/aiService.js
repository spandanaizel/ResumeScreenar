const { GoogleGenerativeAI } = require("@google/generative-ai");
const { cleanJSONResponse } = require("../utils/jsonCleaner");

// Easy to change if the model gets deprecated / a newer fast model is released
const GEMINI_MODEL = "gemini-2.5-flash";

const MAX_RESUME_TEXT_LENGTH = 15000;

const NUMBER_FIELDS = [
  "atsScore",
  "overallMatchPercentage",
  "technicalSkillScore",
  "experienceScore",
  "projectScore",
  "educationScore",
  "keywordMatchScore",
];

const ARRAY_FIELDS = [
  "matchedSkills",
  "missingSkills",
  "recommendedKeywords",
  "strengths",
  "weaknesses",
  "resumeImprovementSuggestions",
];

const STRING_FIELDS = ["roleFit", "summary", "finalRecommendation"];

/**
 * Clamps a value to the 0-100 numeric range. Falls back to 0 if the
 * value is missing, non-numeric, or NaN.
 */
const clampScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
};

/**
 * Ensures the AI response has all expected fields, with safe defaults,
 * so the DB save never breaks even if Gemini omits or malforms a field.
 */
const validateAndNormalize = (parsed) => {
  const result = { ...parsed };

  NUMBER_FIELDS.forEach((field) => {
    result[field] = clampScore(result[field]);
  });

  ARRAY_FIELDS.forEach((field) => {
    result[field] = Array.isArray(result[field]) ? result[field] : [];
  });

  STRING_FIELDS.forEach((field) => {
    result[field] = typeof result[field] === "string" ? result[field] : "";
  });

  // interviewQuestions: array of { question, reason, expectedAnswerHint }
  if (Array.isArray(result.interviewQuestions)) {
    result.interviewQuestions = result.interviewQuestions.map((q) => ({
      question: typeof q?.question === "string" ? q.question : "",
      reason: typeof q?.reason === "string" ? q.reason : "",
      expectedAnswerHint:
        typeof q?.expectedAnswerHint === "string" ? q.expectedAnswerHint : "",
    }));
  } else {
    result.interviewQuestions = [];
  }

  return result;
};

const buildPrompt = (resumeText, jobDescription, jobTitle) => {
  const truncatedResumeText =
    resumeText.length > MAX_RESUME_TEXT_LENGTH
      ? resumeText.slice(0, MAX_RESUME_TEXT_LENGTH)
      : resumeText;

  return `You are an expert ATS resume analyzer and technical recruiter.

Analyze the candidate resume against the given job description.

Return ONLY valid JSON. Do not include markdown, explanation, or extra text.

Resume:
${truncatedResumeText}

Job Description:
${jobDescription}

Target Role:
${jobTitle}

Evaluate the resume based on:
1. ATS score
2. Overall job match percentage
3. Technical skill match
4. Experience relevance
5. Project quality
6. Education relevance
7. Keyword matching
8. Missing skills
9. Resume improvement suggestions
10. Interview questions based on weak areas

Return JSON in this exact structure:

{
  "atsScore": number between 0 and 100,
  "overallMatchPercentage": number between 0 and 100,
  "roleFit": "Excellent Fit" | "Good Fit" | "Average Fit" | "Poor Fit",
  "summary": "short summary",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "technicalSkillScore": number,
  "experienceScore": number,
  "projectScore": number,
  "educationScore": number,
  "keywordMatchScore": number,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "resumeImprovementSuggestions": ["suggestion1", "suggestion2"],
  "recommendedKeywords": ["keyword1", "keyword2"],
  "interviewQuestions": [
    { "question": "question text", "reason": "why this question is relevant", "expectedAnswerHint": "short hint" }
  ],
  "finalRecommendation": "Strong Shortlist" | "Shortlist with Improvements" | "Needs Improvement" | "Not Recommended"
}`;
};

/**
 * Sends the resume + job description to Gemini and returns a validated,
 * safe-to-save JSON object matching the ResumeAnalysis schema fields.
 */
const analyzeResumeWithJD = async (resumeText, jobDescription, jobTitle) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = buildPrompt(resumeText || "", jobDescription || "", jobTitle || "");

  let rawText;
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (error) {
    throw new Error(`Gemini API request failed: ${error.message}`);
  }

  const cleanedText = cleanJSONResponse(rawText);

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error("Failed to parse AI response as valid JSON");
  }

  return validateAndNormalize(parsed);
};

const ALLOWED_ROADMAP_DURATIONS = ["7 days", "15 days", "30 days"];

const buildRoadmapPrompt = (analysisData, duration) => {
  return `You are a career mentor for final-year computer science students.

Create a personalized learning roadmap based on the candidate's resume analysis, missing skills, weak areas, target role, and job description.

Return ONLY valid JSON. Do not include markdown or explanation.

Analysis Data:
${JSON.stringify(analysisData)}

Duration:
${duration}

Return JSON exactly in this structure:

{
  "duration": "${duration}",
  "goal": "clear goal for the candidate",
  "dailyPlan": [
    {
      "day": 1,
      "topic": "topic name",
      "tasks": ["task1", "task2", "task3"],
      "resources": ["resource1", "resource2"],
      "expectedOutcome": "what candidate should learn by end of day"
    }
  ],
  "finalProjectSuggestion": "mini project suggestion to prove the learned skills"
}`;
};

/**
 * Ensures the AI roadmap response has all expected fields, with safe
 * defaults, so the DB save never breaks even if Gemini omits/malforms a field.
 */
const validateAndNormalizeRoadmap = (parsed, duration) => {
  const result = { ...parsed };

  result.duration = typeof result.duration === "string" ? result.duration : duration;
  result.goal = typeof result.goal === "string" ? result.goal : "";
  result.finalProjectSuggestion =
    typeof result.finalProjectSuggestion === "string" ? result.finalProjectSuggestion : "";

  result.dailyPlan = Array.isArray(result.dailyPlan)
    ? result.dailyPlan.map((item, index) => ({
        day: Number.isFinite(Number(item?.day)) ? Number(item.day) : index + 1,
        topic: typeof item?.topic === "string" ? item.topic : "",
        tasks: Array.isArray(item?.tasks) ? item.tasks.filter((t) => typeof t === "string") : [],
        resources: Array.isArray(item?.resources)
          ? item.resources.filter((r) => typeof r === "string")
          : [],
        expectedOutcome: typeof item?.expectedOutcome === "string" ? item.expectedOutcome : "",
      }))
    : [];

  return result;
};

/**
 * Sends the resume analysis + desired duration to Gemini and returns a
 * validated, safe-to-save roadmap JSON object.
 */
const generateRoadmap = async (analysisData, duration) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = buildRoadmapPrompt(analysisData, duration);

  let rawText;
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (error) {
    throw new Error(`Gemini API request failed: ${error.message}`);
  }

  const cleanedText = cleanJSONResponse(rawText);

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error("Failed to parse AI response as valid JSON");
  }

  return validateAndNormalizeRoadmap(parsed, duration);
};

module.exports = {
  analyzeResumeWithJD,
  generateRoadmap,
  ALLOWED_ROADMAP_DURATIONS,
  GEMINI_MODEL,
};
