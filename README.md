# CareerFit AI

AI-powered resume screening and job match analyzer for candidates and recruiters.

CareerFit AI is a full-stack MVP that uses Google's Gemini API to give candidates a recruiter-style evaluation of their resume against a specific job description, and gives recruiters an AI-powered way to rank candidate resumes against a job posting in bulk. Built with real authentication, a real database, real PDF parsing, and real AI calls — no mock data anywhere.

---

## 1. Project Overview

Job seekers rarely get to see their resume the way a recruiter or an Applicant Tracking System (ATS) does, and recruiters spend hours manually reading resumes that could be pre-screened automatically. CareerFit AI closes both gaps in one platform:

- **Candidates** upload a resume + a target job description and instantly get an ATS score, match percentage, skill-gap analysis, resume improvement suggestions, a personalized AI learning roadmap, and mock interview questions.
- **Recruiters** post a job, bulk-upload candidate resumes, and get an AI-ranked candidate table sorted by match quality — instead of reading every resume manually.

## 2. Problem Statement

- Candidates apply blindly, with no visibility into how an ATS or recruiter will actually score their resume against a role.
- Resumes are frequently rejected for missing keywords, weak alignment, or skill gaps the candidate isn't even aware of.
- Candidates have no structured, personalized plan to close those skill gaps before their next application.
- Recruiters manually reading every incoming resume for a job posting is slow, inconsistent, and doesn't scale past a handful of applicants.

There is no single, free, AI-driven tool that serves **both sides** of this problem — candidates who need feedback, and recruiters who need a fast, consistent first pass over applicants.

## 3. Key Features

- Secure JWT-based authentication with role-based access (Candidate / Recruiter)
- Real PDF resume upload with strict validation (PDF-only, 5MB max)
- Real text extraction from PDF resumes via `pdf-parse`
- AI-powered resume-vs-job-description analysis via the Gemini API (ATS score, match %, 5-part score breakdown, skills, strengths/weaknesses, interview questions)
- AI response parsing that safely handles markdown-wrapped JSON and malformed/missing fields
- Personalized AI learning roadmap generator (7/15/30-day plans) built from a candidate's own analysis
- Skill Gap Tracker that aggregates missing skills across all of a candidate's analyses
- Recruiter job postings with full CRUD
- Bulk resume upload (up to 10 PDFs per job) with AI-ranked candidate tables, filters, and sorting
- Dashboard analytics for both roles, computed entirely from real database data — no mock numbers
- Printable/downloadable analysis reports (shared between candidate and recruiter views)
- Fully responsive, professional SaaS-style UI (Tailwind CSS, indigo/blue theme)

## 4. Candidate Features

- Register/login as a Candidate
- Upload a resume PDF + paste a job description + enter a target job title
- Instant AI analysis: ATS score, overall match %, role fit, score breakdown, matched/missing skills, recommended keywords, strengths, weaknesses, resume improvement suggestions, interview questions, final recommendation
- Resume Improvement Report: missing keywords, weak sections, prioritized (High/Medium/Low) actionable improvements, and a "Copy Suggestions" button
- Generate a personalized AI learning roadmap directly from any analysis (day-by-day topics, tasks, resources, expected outcomes, final project suggestion)
- Skill Gap Tracker: see which skills keep showing up as missing across all your analyses, with priority and suggested action
- Dashboard with total analyses, average/highest ATS score, highest match %, most common missing skills/keywords, a score trend chart, and a score-category distribution chart
- Full analysis history with view/delete
- Print/download any analysis report or roadmap

## 5. Recruiter Features

- Register/login as a Recruiter
- Recruiter dashboard: total jobs, resumes analyzed, average match %, top candidates, recent jobs
- Create, edit, and delete job postings (title, company, location, job type, experience level, required/preferred skills, minimum education, salary range, description)
- Bulk-upload up to 10 candidate resume PDFs (5MB max each) per job — each is analyzed against that job's description by Gemini and saved
- Candidate ranking table per job: rank, name, email, ATS score, match %, role fit, missing skill count, final recommendation
- Filter rankings by score range (80+, 60–79, below 60) or role fit; sort by highest match or latest
- View any candidate's full AI analysis report (same report view used on the candidate side) and print/download it
- Deleting a job cascades to delete its associated candidate analyses

## 6. Tech Stack

**Frontend:** React (Vite) + TypeScript, Tailwind CSS, React Router DOM, Axios, Recharts, Lucide React, React Hot Toast

**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, bcryptjs, Multer, pdf-parse, dotenv, cors, helmet, express-rate-limit, morgan

**AI:** Google Gemini API (`@google/generative-ai`)

## 7. System Architecture

```
┌──────────────────┐   HTTPS / JSON, multipart    ┌─────────────────────────────┐
│   React Client     │ ───────────────────────────▶ │      Express API Server      │
│ (Vite + TS +        │ ◀─────────────────────────── │        (Node.js)              │
│  Tailwind, role-     │        JSON responses        │                                │
│  based routing)       │                              │  protect / authorize (JWT)    │
└──────────────────┘                                │             │                  │
        │                                              │             ▼                  │
        │ JWT in localStorage                          │  Multer (single / bulk PDF)   │
        ▼                                              │             │                  │
  Candidate UI   Recruiter UI                          │             ▼                  │
  (dashboard,     (jobs, bulk                          │        pdf-parse               │
   roadmap,        upload, rankings)                    │             │                  │
   skill gaps)                                          │             ▼                  │
                                                          │        aiService.js  ────────┼──▶ Gemini API
                                                          │   (analyze / roadmap prompts) │
                                                          │             │                  │
                                                          │             ▼                  │
                                                          │      Mongoose Models  ─────────┼──▶ MongoDB Atlas
                                                          └─────────────────────────────┘
```

**Analysis request flow:** Client sends a multipart form (PDF + job fields) → `protect` middleware verifies the JWT → Multer validates file type/size → controller extracts text via `pdf-parse` → `aiService` builds a strict JSON-schema prompt and calls Gemini → response is stripped of markdown fences and JSON-parsed → scores are clamped/defaulted for safety → result saved to MongoDB → full document returned to the client for rendering.

## 8. Folder Structure

```txt
ResumeScreenar/
│
├── client/                          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/            # AnalysisReportView (shared candidate/recruiter report)
│   │   │   ├── common/              # LoadingSpinner, EmptyState, ErrorState, ScoreCircle, Badge, Modal
│   │   │   ├── layout/              # Navbar, Sidebar, DashboardLayout, PublicLayout, ProtectedRoute
│   │   │   └── ui/                  # Button, Card, Input, Textarea
│   │   ├── context/                 # AuthContext
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage, RegisterPage
│   │   │   ├── candidate/           # Dashboard, Analyze, History, AnalysisDetails, Roadmaps, RoadmapDetails, SkillGap
│   │   │   ├── recruiter/           # Dashboard, Jobs list/create/details, UploadResumes, AnalysisDetails
│   │   │   └── public/              # LandingPage
│   │   ├── services/                # api.ts, authService, candidateService, roadmapService, recruiterService
│   │   ├── types/                   # shared TypeScript interfaces
│   │   ├── utils/                   # formatting/score helpers
│   │   ├── App.tsx                  # role-based routing
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/                  # MongoDB connection
│   │   ├── controllers/             # auth, candidate, roadmap, recruiter
│   │   ├── middleware/              # authMiddleware (protect/authorize), errorMiddleware, uploadMiddleware
│   │   ├── models/                  # User, ResumeAnalysis, Roadmap, Job
│   │   ├── routes/                  # authRoutes, candidateRoutes, recruiterRoutes
│   │   ├── services/                # aiService.js (Gemini: analysis + roadmap prompts)
│   │   ├── utils/                   # resumeParser, jsonCleaner
│   │   └── server.js
│   ├── uploads/                     # multer memory storage; folder kept via .gitkeep
│   ├── package.json
│   └── .env.example
│
├── sample-data/                     # sample job descriptions for demo/testing
├── README.md
├── PROJECT_REPORT.md
├── DEPLOYMENT.md
├── VIVA_GUIDE.md
└── DEMO_SCRIPT.md
```

## 9. Environment Variables

### `server/.env`
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> `GEMINI_API_KEY` is **never** hardcoded — it is read only from `process.env.GEMINI_API_KEY` inside `server/src/services/aiService.js`. Copy each `.env.example` to `.env` and fill in your own values before running the project. Never commit a real `.env` file.

## 10. Installation Steps

### Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (local MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Gemini API key](https://ai.google.dev/) (free tier available from Google AI Studio)

### Backend
```bash
cd server
npm install
copy .env.example .env      # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
```

### Frontend
```bash
cd client
npm install
copy .env.example .env      # defaults to http://localhost:5000/api
```

## 11. How to Run Locally

```bash
# Terminal 1 — backend
cd server
npm run dev          # http://localhost:5000

# Terminal 2 — frontend
cd client
npm run dev           # http://localhost:5173
```

Open `http://localhost:5173`, register as either a **Candidate** or a **Recruiter**, and explore the corresponding dashboard.

## 12. API Routes

### Auth (`/api/auth`)
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new user (`role`: candidate or recruiter) | Public |
| POST | `/login` | Login and receive a JWT | Public |
| GET | `/me` | Get the current logged-in user | Protected |

### Candidate (`/api/candidate`)
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/analyze` | Upload resume PDF + job description → AI analysis | Protected |
| GET | `/analyses` | List all past analyses for the current user | Protected |
| GET | `/analyses/:id` | Get one analysis in full detail | Protected |
| DELETE | `/analyses/:id` | Delete an analysis | Protected |
| GET | `/skill-gaps` | Aggregated missing-skill frequency + priority | Protected |
| POST | `/roadmap/:analysisId` | Generate an AI learning roadmap from an analysis | Protected |
| GET | `/roadmaps` | List all roadmaps for the current user | Protected |
| GET | `/roadmaps/:id` | Get one roadmap in full detail | Protected |
| DELETE | `/roadmaps/:id` | Delete a roadmap | Protected |

### Recruiter (`/api/recruiter`) — requires `role: recruiter`
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/jobs` | Create a job posting | Protected + recruiter |
| GET | `/jobs` | List jobs created by the recruiter | Protected + recruiter |
| GET | `/jobs/:id` | Get one job's details | Protected + recruiter |
| PUT | `/jobs/:id` | Update a job posting | Protected + recruiter |
| DELETE | `/jobs/:id` | Delete a job (cascades to its analyses) | Protected + recruiter |
| POST | `/jobs/:jobId/analyze-resumes` | Bulk-upload + analyze up to 10 resumes for a job | Protected + recruiter |
| GET | `/jobs/:jobId/rankings` | Ranked candidates for a job (filters: `minScore`, `maxScore`, `roleFit`, `sortBy`) | Protected + recruiter |
| GET | `/analyses/:id` | Get one candidate analysis in full detail | Protected + recruiter |

All protected routes require an `Authorization: Bearer <token>` header.

## 13. AI Workflow

1. Resume text (via `pdf-parse`), job description, and job title are assembled server-side.
2. A strict prompt instructs Gemini to act as "an expert ATS resume analyzer and technical recruiter" (or, for roadmaps, "a career mentor for final-year computer science students") and to **return only valid JSON** matching an explicit schema.
3. The prompt is sent to Gemini using the model configured in `aiService.js`, authenticated only via `GEMINI_API_KEY` from `.env`.
4. The raw response is passed through `cleanJSONResponse()`, which strips ` ```json ... ``` ` markdown fences some models add.
5. The cleaned text is parsed with `JSON.parse`. All numeric fields are clamped to 0–100; all array/string fields default to safe empty values if the model omits them — a malformed AI response never crashes the app or corrupts the database.
6. If the Gemini call fails or the response can't be parsed, the backend returns a clean error response instead of crashing.
7. The validated result is persisted to MongoDB (plus the raw AI response, kept for auditability) and returned to the client.

## 14. Database Models

- **User** — `name`, `email`, `password` (bcrypt-hashed), `role` (`candidate` / `recruiter` / `admin`), timestamps
- **ResumeAnalysis** — `userId`, optional `jobId` (for recruiter-uploaded resumes), candidate name/email, resume text, job fields, all AI-generated scores/skills/suggestions, `interviewQuestions[]`, `finalRecommendation`, `rawAIResponse`, timestamps
- **Roadmap** — `userId`, `analysisId`, `duration`, `goal`, `dailyPlan[]` (`day`, `topic`, `tasks[]`, `resources[]`, `expectedOutcome`), `finalProjectSuggestion`, timestamps
- **Job** — `title`, `companyName`, `location`, `jobType`, `experienceLevel`, `description`, `requiredSkills[]`, `preferredSkills[]`, `minimumEducation`, `salaryRange`, `createdBy`, timestamps

## 15. Screenshots

> _Add screenshots here before submission/sharing:_
- Landing page
- Candidate dashboard
- Analysis details / report page
- Roadmap details page
- Skill gap tracker
- Recruiter dashboard
- Job details + candidate rankings

## 16. Future Enhancements

- Admin role with platform-wide analytics and user management
- Support for DOCX resumes in addition to PDF
- Server-rendered PDF export instead of browser print
- Email notifications for analysis completion and roadmap reminders
- Applicant messaging between recruiters and candidates
- Fine-tuned/few-shot prompting using anonymized recruiter feedback to improve scoring accuracy
- Pagination and search for large job/analysis lists

## 17. Resume Points

```txt
- Developed CareerFit AI, an AI-powered resume screening and job matching platform using React, Node.js, Express, MongoDB, and Gemini API.
- Implemented PDF resume parsing, ATS score generation, JD matching, skill gap detection, personalized roadmap generation, and AI-generated interview preparation.
- Built candidate and recruiter dashboards with analytics, candidate ranking, bulk resume upload, role-based authentication, and report generation.
```

## 18. Author

Built as a final-year CSE academic project — engineered like a real production MVP: real authentication, a real database, real PDF parsing, and real AI analysis throughout.

**Repository:** [github.com/Dhanush354/ResumeScreenar](https://github.com/Dhanush354/ResumeScreenar)
