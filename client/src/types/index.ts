// Shared TypeScript interfaces matching backend models.

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface InterviewQuestion {
  question: string;
  reason: string;
  expectedAnswerHint: string;
}

export type RoleFit = 'Excellent Fit' | 'Good Fit' | 'Average Fit' | 'Poor Fit' | string;

export type FinalRecommendation =
  | 'Strong Shortlist'
  | 'Shortlist with Improvements'
  | 'Needs Improvement'
  | 'Not Recommended'
  | string;

export interface ResumeAnalysis {
  _id: string;
  userId: string;
  jobId?: string | null;
  candidateName: string;
  candidateEmail: string;
  resumeFileName: string;
  resumeText: string;
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
  atsScore: number;
  overallMatchPercentage: number;
  roleFit: RoleFit;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedKeywords: string[];
  technicalSkillScore: number;
  experienceScore: number;
  projectScore: number;
  educationScore: number;
  keywordMatchScore: number;
  strengths: string[];
  weaknesses: string[];
  resumeImprovementSuggestions: string[];
  interviewQuestions: InterviewQuestion[];
  finalRecommendation: FinalRecommendation;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeResumePayload {
  resume: File;
  jobDescription: string;
  jobTitle: string;
  companyName?: string;
}

export interface ApiErrorResponse {
  message: string;
}

// --- Roadmap ---

export type RoadmapDuration = '7 days' | '15 days' | '30 days';

export interface DailyPlanItem {
  day: number;
  topic: string;
  tasks: string[];
  resources: string[];
  expectedOutcome: string;
}

export interface RoadmapAnalysisRef {
  _id: string;
  jobTitle: string;
  companyName?: string;
}

export interface Roadmap {
  _id: string;
  userId: string;
  analysisId: RoadmapAnalysisRef | string;
  duration: string;
  goal: string;
  dailyPlan: DailyPlanItem[];
  finalProjectSuggestion: string;
  createdAt: string;
  updatedAt: string;
}

// --- Skill Gap Tracker ---

export type SkillGapPriority = 'High' | 'Medium' | 'Low';

export interface SkillGap {
  skill: string;
  count: number;
  priority: SkillGapPriority;
  suggestedAction: string;
}

// --- Recruiter: Jobs ---

export interface Job {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumEducation?: string;
  salaryRange?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title: string;
  companyName: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumEducation?: string;
  salaryRange?: string;
}

export interface BulkAnalyzeResult {
  analyzed: ResumeAnalysis[];
  failed: { fileName: string; message: string }[];
}

export interface RankingFilters {
  minScore?: number;
  maxScore?: number;
  roleFit?: string;
  sortBy?: 'highestMatch' | 'latest';
}
