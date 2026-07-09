<div align="center">

# PROJECT REPORT

## CareerFit AI

### AI-Powered Resume Screening and Job Match Analyzer for Candidates and Recruiters

**A Final Year Project Report**

Submitted in partial fulfillment of the requirements for the degree of

**Bachelor of Engineering / Technology in Computer Science and Engineering**

---

*(Institution name, department, student name(s), roll number(s), guide name, and academic year to be filled in before submission)*

</div>

---

## 1. Title Page

**Project Title:** CareerFit AI — AI-Powered Resume Screening and Job Match Analyzer for Candidates and Recruiters

**Domain:** Full-Stack Web Development, Artificial Intelligence / Generative AI, Applicant Tracking Systems

**Technologies Used:** React, TypeScript, Node.js, Express.js, MongoDB, Google Gemini API

*(Insert institution logo, student details, guide details, and submission date here.)*

---

## 2. Abstract

CareerFit AI is a full-stack web application that uses a generative AI model (Google's Gemini) to evaluate how well a candidate's resume matches a specific job description, and separately gives recruiters a way to bulk-analyze and rank candidate resumes against a job posting. On the candidate side, a user registers, uploads a resume in PDF format, and provides a target job title and description; the system extracts the resume text, sends it to Gemini with a strict JSON-schema prompt, and returns an ATS compatibility score, an overall match percentage, a five-dimension score breakdown, matched/missing skills, resume improvement suggestions, AI-generated interview questions, and a personalized day-by-day learning roadmap to close identified skill gaps. On the recruiter side, a user posts a job, uploads up to ten candidate resumes at once, and receives an AI-ranked table of candidates sortable and filterable by match score and role fit. The system is built with a React/TypeScript frontend, a Node.js/Express backend, MongoDB for persistence, JWT for role-based authentication, and the Gemini API as the AI analysis engine — with no mocked data anywhere in the pipeline.

## 3. Introduction

Modern hiring is a two-sided information problem. On one side, job seekers submit resumes with little to no visibility into how an Applicant Tracking System or a human recruiter will actually score them against a role — most candidates learn a resume was rejected only through silence. On the other side, recruiters and hiring managers are flooded with resumes for every posting and cannot manually read each one carefully, especially for early screening rounds. CareerFit AI addresses both sides of this problem within a single platform: it gives candidates a recruiter-style, AI-driven evaluation of their resume so they can improve it *before* applying, and it gives recruiters an automated first-pass ranking of candidates so they can focus their attention on the strongest applicants.

## 4. Problem Statement

Job seekers frequently submit resumes that are technically qualified but are filtered out due to missing or mismatched keywords relative to the job description, poor alignment between resume content and role requirements, a lack of awareness of which skills are missing for a target role, and no structured way to prepare for interviews based on their own resume's weak points. On the recruiting side, teams manually reviewing every incoming resume for a job posting is slow, inconsistent between reviewers, and does not scale once a posting receives more than a handful of applicants. There is no single, accessible, AI-driven tool that serves both the candidate's need for feedback and the recruiter's need for fast, consistent screening.

## 5. Objectives

1. Build a secure, role-based (candidate/recruiter) full-stack authentication system.
2. Allow candidates to upload a real PDF resume and have its text extracted programmatically.
3. Integrate a large language model (Gemini API) to perform genuine semantic comparison between a resume and a job description, not simple keyword matching.
4. Produce a structured, quantifiable output: ATS score, match percentage, and a multi-dimensional score breakdown.
5. Surface actionable feedback: strengths, weaknesses, missing skills, and resume improvement suggestions.
6. Generate a personalized, AI-driven day-by-day learning roadmap to help candidates close identified skill gaps.
7. Track recurring missing skills across a candidate's full analysis history.
8. Allow recruiters to post jobs and bulk-analyze multiple candidate resumes against a single job description.
9. Rank, filter, and sort candidates by AI-computed match quality.
10. Persist every analysis and roadmap so users can review history and track improvement over time.
11. Present all of the above through a clean, modern, responsive dashboard UI for both roles.

## 6. Existing System

Prior to tools like this, candidates and recruiters typically rely on: **manual resume review** — asking peers, mentors, or career counselors to review a resume, which is slow, inconsistent, and not tailored to a specific job description; **generic ATS checkers** — simple keyword-density tools that count overlapping words between a resume and a job description without understanding context, seniority, or relevance; and, on the recruiting side, **fully manual resume screening**, where a recruiter or hiring manager reads every applicant's resume individually with no automated pre-ranking.

## 7. Limitations of Existing System

- Manual review does not scale and depends entirely on the reviewer's individual expertise and availability.
- Keyword-density tools have no semantic understanding — they cannot tell whether a candidate's stated experience is actually relevant to the role, only whether certain words appear.
- Candidates receive no structured plan for *how* to close the gaps identified, only a pass/fail signal at best.
- Recruiters reviewing resumes manually introduce inconsistency between reviewers and cannot easily re-rank or filter candidates once initial impressions are formed.
- No existing lightweight tool serves both the candidate and recruiter sides of the same hiring workflow together.

## 8. Proposed System

CareerFit AI proposes an automated, AI-driven pipeline with two cooperating modules:

1. A role-based account system (JWT-secured) distinguishing Candidates from Recruiters, so each role sees a dedicated dashboard and workflow.
2. Real PDF upload and text extraction (via `pdf-parse`), removing any manual copy-pasting of resume content.
3. A generative AI model (Gemini) prompted specifically to act as "an expert ATS resume analyzer and technical recruiter," producing a structured JSON evaluation rather than free-form text — making the output reliably renderable in a UI and comparable across analyses.
4. A roadmap-generation prompt that takes a candidate's own analysis (missing skills, weak areas, target role) and produces a concrete, day-by-day learning plan with tasks, resources, and a capstone project suggestion.
5. A skill-gap aggregation feature that scans a candidate's full analysis history to surface which skills are *repeatedly* missing, with a computed priority.
6. A recruiter-facing job-posting and bulk-analysis module that runs the same AI evaluation across many resumes at once and produces a sortable, filterable ranking table.
7. Full persistence and history for both roles, so users can revisit and track progress over time.

## 9. Advantages of Proposed System

- Genuine semantic evaluation instead of keyword counting, since the AI model reads and reasons about both documents in full context.
- Actionable, structured output (scores, skill lists, suggestions, interview questions, a learning roadmap) instead of a single opaque score.
- Consistent, repeatable evaluation criteria across every resume/job pair, removing reviewer-to-reviewer inconsistency.
- Scales trivially on the recruiter side — ranking ten resumes takes the same effort as ranking one.
- Serves both sides of the hiring workflow (candidate self-improvement and recruiter screening) from one shared AI evaluation engine and one shared report view.
- Resilient to AI response variability: markdown-wrapped or partially malformed JSON responses are sanitized and defaulted rather than crashing the system.

## 10. System Architecture

```
┌──────────────────┐   HTTPS / JSON, multipart    ┌─────────────────────────────┐
│   React Client     │ ───────────────────────────▶ │      Express API Server      │
│ (Vite + TypeScript, │ ◀─────────────────────────── │        (Node.js)              │
│  role-based routing) │        JSON responses        │                                │
└──────────────────┘                                │  protect / authorize (JWT)    │
        │                                              │             │                  │
        │ JWT stored in localStorage                   │             ▼                  │
        ▼                                              │  Multer (single / bulk PDF)   │
  Candidate UI    Recruiter UI                         │             │                  │
  (analyze, history,  (jobs, bulk upload,               │             ▼                  │
   roadmap, skill gaps) rankings)                        │        pdf-parse               │
                                                          │             │                  │
                                                          │             ▼                  │
                                                          │        aiService.js  ────────┼──▶ Gemini API
                                                          │   (analysis + roadmap prompts) │
                                                          │             │                  │
                                                          │             ▼                  │
                                                          │      Mongoose Models  ─────────┼──▶ MongoDB Atlas
                                                          └─────────────────────────────┘
```

**Analysis request flow:** Client (multipart form: PDF + job fields) → auth middleware validates the JWT → upload middleware validates PDF type/size → controller extracts text via `pdf-parse` → `aiService` builds the prompt and calls Gemini → response is stripped of markdown fences and JSON-parsed → scores are validated/clamped → result saved to MongoDB → full document returned to the client for rendering.

## 11. Module Description

1. **Authentication Module** — Registration (with role selection), login, JWT issuance/verification, session persistence, role-based protected routes.
2. **Resume Upload & Parsing Module** — Multer-based file validation (single and bulk), PDF text extraction via `pdf-parse`.
3. **AI Analysis Module** — Prompt construction, Gemini API calls, response cleaning/validation for both resume analysis and roadmap generation.
4. **Analysis Persistence Module** — MongoDB schema and CRUD operations for `ResumeAnalysis`.
5. **Roadmap Module** — Generates, stores, lists, and deletes AI-generated learning roadmaps linked to a specific analysis.
6. **Skill Gap Tracker Module** — Aggregates missing skills across a candidate's full analysis history with computed priority.
7. **Candidate Dashboard Module** — Aggregate statistics, trend and distribution charts, computed entirely from real stored data.
8. **Recruiter Job Module** — Job posting CRUD scoped to the recruiter who created it.
9. **Recruiter Bulk Analysis & Ranking Module** — Bulk resume analysis against a job, with a filterable/sortable ranking table.
10. **Shared Report Module** — A single reusable report view rendering full analysis detail, shared by both candidate and recruiter pages, with print/download support.

## 12. Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React (Vite) + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router DOM (role-based route guards) |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend runtime | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| File upload | Multer (memory storage, single + bulk) |
| PDF parsing | pdf-parse |
| AI | Google Gemini API (`@google/generative-ai`) |
| Security/middleware | helmet, cors, express-rate-limit, morgan |

## 13. Database Design

### Collection: `users`
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | required, bcrypt-hashed, excluded from query results by default |
| role | String | enum: `candidate`, `recruiter`, `admin` (default `candidate`) |
| createdAt / updatedAt | Date | auto-managed timestamps |

### Collection: `resumeanalyses`
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | ref → `User`, required (owner: candidate, or recruiter who ran the analysis) |
| jobId | ObjectId | ref → `Job`, optional — set only for recruiter-uploaded analyses |
| candidateName, candidateEmail | String | extracted from resume text |
| resumeFileName, resumeText | String | original filename + extracted text |
| jobTitle, companyName, jobDescription | String | |
| atsScore, overallMatchPercentage | Number | 0–100 |
| roleFit | String | e.g. "Good Fit" |
| summary | String | AI-generated summary |
| matchedSkills, missingSkills, recommendedKeywords | [String] | |
| technicalSkillScore, experienceScore, projectScore, educationScore, keywordMatchScore | Number | 0–100 each |
| strengths, weaknesses, resumeImprovementSuggestions | [String] | |
| interviewQuestions | [{ question, reason, expectedAnswerHint }] | |
| finalRecommendation | String | e.g. "Strong Shortlist" |
| rawAIResponse | Mixed | full parsed AI response, kept for auditability |
| createdAt / updatedAt | Date | auto-managed timestamps |

### Collection: `roadmaps`
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | ref → `User`, required |
| analysisId | ObjectId | ref → `ResumeAnalysis`, required |
| duration | String | "7 days" / "15 days" / "30 days" |
| goal | String | AI-generated goal statement |
| dailyPlan | [{ day, topic, tasks[], resources[], expectedOutcome }] | |
| finalProjectSuggestion | String | |
| createdAt / updatedAt | Date | |

### Collection: `jobs`
| Field | Type | Notes |
|---|---|---|
| title, companyName | String | required |
| location, jobType, experienceLevel | String | |
| description | String | required |
| requiredSkills, preferredSkills | [String] | |
| minimumEducation, salaryRange | String | |
| createdBy | ObjectId | ref → `User` (recruiter), required |
| createdAt / updatedAt | Date | |

**Relationships:** one `User` (candidate) has many `ResumeAnalysis` and `Roadmap` documents; one `User` (recruiter) has many `Job` documents; one `Job` has many `ResumeAnalysis` documents (bulk-uploaded candidates); one `ResumeAnalysis` has at most one `Roadmap`.

## 14. API Design

### Auth
- `POST /api/auth/register` — `{ name, email, password, role }` → `201 { token, user }`
- `POST /api/auth/login` — `{ email, password }` → `200 { token, user }`
- `GET /api/auth/me` — (protected) → `200 { user }`

### Candidate
- `POST /api/candidate/analyze` — multipart (`resume`, `jobDescription`, `jobTitle`, `companyName`) → `201 <analysis>`
- `GET /api/candidate/analyses` / `GET /api/candidate/analyses/:id` / `DELETE /api/candidate/analyses/:id`
- `GET /api/candidate/skill-gaps` → aggregated missing-skill frequency + priority
- `POST /api/candidate/roadmap/:analysisId` — `{ duration }` → `201 <roadmap>`
- `GET /api/candidate/roadmaps` / `GET /api/candidate/roadmaps/:id` / `DELETE /api/candidate/roadmaps/:id`

### Recruiter (role: recruiter only)
- `POST /api/recruiter/jobs` / `GET /api/recruiter/jobs` / `GET /api/recruiter/jobs/:id` / `PUT /api/recruiter/jobs/:id` / `DELETE /api/recruiter/jobs/:id`
- `POST /api/recruiter/jobs/:jobId/analyze-resumes` — multipart, up to 10 `resumes` files
- `GET /api/recruiter/jobs/:jobId/rankings?minScore=&maxScore=&roleFit=&sortBy=`
- `GET /api/recruiter/analyses/:id`

All protected endpoints require `Authorization: Bearer <token>`. Standard status codes are used throughout (200/201 success, 400 validation, 401 authentication, 403 authorization/role, 404 not found, 500 unexpected). A centralized Express error-handling middleware ensures no stack traces are leaked in production.

## 15. AI Integration Workflow

1. **Input assembly** — resume text (via `pdf-parse`), job description, and job title are collected server-side.
2. **Prompt construction** — a fixed, schema-constrained prompt instructs Gemini to act as an expert evaluator (resume analysis) or career mentor (roadmap generation) and to return **only valid JSON**.
3. **Model call** — the prompt is sent via the Gemini API using `GEMINI_API_KEY`, read only from environment variables, never hardcoded.
4. **Response sanitization** — `cleanJSONResponse()` strips any ` ```json ... ``` ` markdown wrapping the model may add.
5. **Parsing & validation** — the cleaned text is parsed with `JSON.parse`. Numeric fields are clamped to 0–100; array/string fields default to safe empty values if omitted, so a malformed AI response never crashes the app or corrupts the database.
6. **Failure handling** — network errors, quota errors, or unparseable responses are caught and surfaced as a clean error response instead of crashing the server.
7. **Persistence** — the validated result (plus the raw AI response, for auditability) is saved to MongoDB.

## 16. Resume Analysis Workflow

Candidate uploads PDF + job title + job description → backend validates file type/size and required fields → `pdf-parse` extracts resume text → email/name are heuristically extracted from the text → resume text + job description + job title are sent to Gemini with the analysis prompt → response is cleaned, parsed, and validated → a `ResumeAnalysis` document is created with all scores, skills, suggestions, and interview questions → the full document is returned to the client and rendered via the shared `AnalysisReportView` component.

## 17. Roadmap Generation Workflow

From an existing analysis, the candidate selects a duration (7/15/30 days) → the backend fetches that analysis (scoped to the requesting user) → assembles a payload of job title, job description, scores, matched/missing skills, strengths/weaknesses, and improvement suggestions → sends this to Gemini with the roadmap prompt, requesting a day-by-day plan → the response is cleaned/parsed/validated (each day normalized to `{ day, topic, tasks[], resources[], expectedOutcome }`) → a `Roadmap` document is created, linked to the source analysis → the client renders it with a day-by-day layout and a final project suggestion, with print support.

## 18. Recruiter Ranking Workflow

Recruiter creates a job posting → uploads up to 10 candidate resume PDFs at once → each file is validated (PDF, ≤5MB) and parsed independently; a failure on one file does not block the rest of the batch → each resume's text is sent to Gemini against the same job description/title → each result is saved as a `ResumeAnalysis` linked to both the recruiter (`userId`) and the job (`jobId`) → the recruiter opens the job's ranking table, which queries all analyses for that `jobId`, supports score-range and role-fit filters, and supports sorting by highest match or most recent → clicking a candidate opens the same shared report view used on the candidate side.

## 19. Security Features

- Passwords hashed with bcrypt before storage; never returned in API responses.
- Stateless JWT authentication with configurable expiry (`JWT_EXPIRES_IN`), verified on every protected request.
- Role-based authorization middleware (`authorize('recruiter')`) restricting recruiter-only endpoints.
- Ownership scoping on every query — a user can only read/update/delete their own analyses, roadmaps, and jobs (queries filter by `userId`/`createdBy`, never by ID alone).
- Strict file-upload validation: PDF-only MIME type check and a 5MB size cap, enforced by both Multer and the controller.
- `helmet` for secure HTTP headers, `cors` scoped to the configured `CLIENT_URL`, and `express-rate-limit` on all API routes (stricter limits on auth routes to reduce brute-force risk).
- Centralized error handling that never leaks stack traces in production (`NODE_ENV=production`).
- The Gemini API key is read only from `process.env.GEMINI_API_KEY` and is never hardcoded or exposed to the frontend.

## 20. Testing

- **Manual functional testing:** registration/login for both roles, protected route access without a token, resume upload with valid/invalid file types and oversized files, full analyze → view → delete lifecycle for both analyses and roadmaps.
- **Role-guard testing:** verified a candidate account receives `403` on recruiter-only routes and is redirected away from `/recruiter/*` pages in the UI, and vice versa.
- **API testing:** each route tested for correct status codes and response shapes, including error paths (missing fields, invalid IDs, resources belonging to another user).
- **AI response resilience testing:** verified the backend does not crash when Gemini returns markdown-wrapped JSON or a partially malformed/incomplete response, thanks to the clamping/defaulting logic in `aiService.js`.
- **Bulk upload testing:** verified that one corrupt/unreadable file in a batch of resumes does not abort the rest of the batch, and that per-file failures are reported back to the recruiter.
- **Frontend testing:** TypeScript strict-mode compilation with zero errors, manual UI walkthroughs of every page across loading, empty, error, and success states, and responsive layout checks at mobile/tablet/desktop breakpoints.

## 21. Results

The completed system delivers two fully functional, role-specific workflows on a shared codebase. A candidate can register, upload a real resume PDF, submit a job description, and receive a genuine AI-generated evaluation within seconds, along with a personalized learning roadmap and a running skill-gap profile across all their analyses. A recruiter can post a job, bulk-upload multiple candidate resumes, and immediately see a ranked, filterable candidate table without reading a single resume manually. Both roles share a consistent, chart-rich report view. The system handles error conditions gracefully — invalid files, AI/network failures, partial batch failures, and unauthorized/cross-role access all return clean, user-facing messages rather than crashes.

## 22. Screenshots

*(Insert screenshots here before final submission: landing page, candidate dashboard, analysis report, roadmap details, skill gap tracker, recruiter dashboard, job details with candidate rankings.)*

## 23. Future Scope

- Admin role with platform-wide analytics, user management, and moderation.
- Support for additional resume formats (DOCX, plain text).
- Server-rendered PDF export instead of relying on browser print.
- Email notifications for analysis completion, roadmap reminders, and new candidate rankings.
- Messaging between recruiters and shortlisted candidates.
- Fine-tuned/few-shot prompting using anonymized recruiter feedback to further improve scoring accuracy.
- Pagination, search, and saved filter presets for large job/candidate lists.

## 24. Conclusion

CareerFit AI demonstrates how generative AI can be applied practically to a real, everyday problem on both sides of the hiring process: candidates not knowing how their resume measures up before applying, and recruiters not having time to manually screen every applicant. By combining secure, role-based authentication, real PDF processing, and a tightly-scoped, schema-constrained AI integration across resume analysis, roadmap generation, and bulk candidate ranking, the project delivers a genuinely useful two-sided MVP rather than a superficial demo — while remaining a clean, well-structured codebase suitable for an academic final-year submission and a strong portfolio piece.
