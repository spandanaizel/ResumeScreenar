# Viva / Presentation Guide — CareerFit AI

A script and Q&A bank for presenting and defending this project in a viva, review, or interview.

---

## 1. Project Introduction Speech (say this first, ~1 minute)

> "Good morning/afternoon. My project is called **CareerFit AI** — an AI-powered resume screening and job match analyzer built for two kinds of users: candidates and recruiters.
>
> On the candidate side, a user uploads their resume as a PDF, pastes a job description they're targeting, and within seconds gets an AI-generated evaluation — an ATS score, a match percentage, missing skills, resume improvement suggestions, and even a personalized day-by-day learning roadmap to close their skill gaps.
>
> On the recruiter side, a user posts a job, uploads multiple candidate resumes at once, and gets back a ranked table of candidates sorted by how well they match the role — instead of reading every resume manually.
>
> The whole system is built with React and TypeScript on the frontend, Node.js and Express on the backend, MongoDB for storage, and Google's Gemini API as the AI engine that actually reads and evaluates the resumes. Everything you'll see is real — real authentication, a real database, real PDF text extraction, and real AI calls, no mock data anywhere."

## 2. Problem Statement Explanation

> "The problem I'm solving has two sides. Candidates apply to jobs with no visibility into how an ATS or a recruiter will actually score their resume — they often get silently rejected and never learn why. Recruiters, on the other hand, receive dozens or hundreds of resumes per posting and can't realistically read each one in detail. Existing tools either do simple keyword matching, which has no real understanding of context, or require a human in the loop, which doesn't scale. CareerFit AI solves both problems with one AI evaluation engine shared across both roles."

## 3. Why This Project Is Innovative

- It's **two-sided** — most student projects pick either the candidate side (resume checkers) or the recruiter side (ATS dashboards). This project connects both to the same AI evaluation core and the same report component, so there's no duplicated logic.
- It goes beyond a single score: it produces a **learning roadmap** — a genuinely actionable next step, not just a rejection reason.
- It tracks **skill gaps over time**, aggregating across a candidate's full history rather than evaluating one resume in isolation.
- The AI integration is **schema-constrained** — the model is forced into a strict JSON contract, which is a practical, production-relevant pattern for using LLMs reliably inside an application (as opposed to just displaying raw chatbot text).
- It includes **real engineering concerns** most course projects skip: JWT expiry, role-based authorization, rate limiting, file-size/type validation, and safe handling of malformed AI output.

## 4. Complete User Flow Explanation

1. A new user visits the landing page and registers, choosing either **Candidate** or **Recruiter**.
2. They log in and are redirected to their role's dashboard (`/candidate/dashboard` or `/recruiter/dashboard`) — the router enforces this, so a candidate can never see recruiter pages and vice versa.
3. **Candidate:** uploads a resume + job description → gets an AI report → optionally generates a roadmap from that report → can revisit history, skill gaps, and roadmaps at any time → can delete anything they created.
4. **Recruiter:** creates a job posting → uploads a batch of candidate resumes → gets a ranked table → filters/sorts it → opens any candidate's full report.
5. Both roles can log out at any point; JWTs expire automatically after the configured duration.

## 5. Candidate Module Explanation

The candidate module covers: resume upload with strict validation (PDF only, 5MB max, enforced on both the client and server), AI analysis (ATS score, match %, five-part score breakdown, skills, strengths/weaknesses, interview questions, final recommendation), a **Resume Improvement Report** section with prioritized suggestions and a one-click copy button, a **Roadmap Generator** that turns any analysis into a day-by-day AI study plan, a **Skill Gap Tracker** that aggregates missing skills across every analysis the candidate has ever run, and a **dashboard** with real analytics (trend chart, score-category distribution, most common missing skills) computed entirely from the candidate's own stored data.

## 6. Recruiter Module Explanation

The recruiter module covers: job posting CRUD (create/edit/delete, scoped so a recruiter only ever sees their own jobs), **bulk resume upload** (up to 10 PDFs per request, each independently validated and parsed — one bad file doesn't fail the whole batch), AI analysis of every uploaded resume against that job's description, and a **ranking table** with filters (score bucket, role fit) and sorting (highest match, latest), plus the ability to open any candidate's full report using the exact same report component the candidate side uses.

## 7. AI Workflow Explanation

The backend never lets Gemini return free-form text into the app. Every prompt explicitly instructs the model to "return ONLY valid JSON" matching a fixed schema (specific field names, specific types). Once a response comes back, it goes through a small pipeline: strip any markdown code fences the model might add (`cleanJSONResponse`), `JSON.parse` the result, then clamp every numeric field to 0–100 and default every array/string field to a safe empty value if the model omitted it. This means even an imperfect AI response can never crash the server or save corrupted data. The same pattern is reused for two different prompts: one for resume-vs-job analysis, and one for roadmap generation.

## 8. Database Explanation

MongoDB (via Mongoose) stores four collections: **User** (role-based: candidate/recruiter/admin), **ResumeAnalysis** (every AI evaluation, linked to the owning user and optionally to a job), **Roadmap** (linked to the analysis it was generated from), and **Job** (recruiter postings). Ownership is enforced at the query level — every read/update/delete filters by the requesting user's ID (`userId` or `createdBy`), not just by the document's own ID, so no user can access another user's data even if they guess a valid ID.

## 9. Security Explanation

- Passwords are hashed with bcrypt before storage and are never included in any API response.
- Authentication is stateless JWT, verified via middleware on every protected route.
- Recruiter-only routes have an additional authorization middleware checking `role === 'recruiter'`.
- All list/detail/delete queries are scoped to the requesting user — there is no endpoint that returns another user's private data.
- File uploads are restricted to PDF MIME type and a 5MB size cap, checked at the multer layer and again in the controller.
- `helmet` sets secure HTTP headers, `cors` is scoped to a configured client origin, and `express-rate-limit` throttles both general API traffic and (more strictly) auth endpoints to reduce brute-force risk.
- The Gemini API key lives only in a server-side `.env` file, read via `process.env.GEMINI_API_KEY` — it is never sent to or embedded in the frontend.

## 10. Possible Viva Questions and Answers

**Q1. What problem does CareerFit AI solve?**
It gives candidates AI-driven, recruiter-style feedback on how their resume matches a specific job before they apply, and gives recruiters an automated way to screen and rank bulk candidate resumes for a job posting — solving both sides of the same hiring-feedback gap.

**Q2. Why did you use AI in this project instead of simple keyword matching?**
Keyword matching only checks if words overlap; it can't judge whether experience is actually relevant, how strong a match is, or generate original suggestions and interview questions. An LLM can read both documents in full context and produce a genuinely reasoned, structured evaluation.

**Q3. What is an ATS score?**
An ATS (Applicant Tracking System) score estimates how well a resume would pass through the automated filtering software many companies use before a human ever reads it — based on factors like keyword alignment, formatting clarity, and relevant experience.

**Q4. How does resume parsing work in your project?**
The uploaded PDF is stored in memory (via Multer's memory storage, never written to disk unnecessarily), then passed as a buffer to the `pdf-parse` library, which extracts the raw text content. That text is then used both for a quick regex-based email/name extraction and as the input to the AI prompt.

**Q5. How does the Gemini API work in your project?**
The backend builds a prompt containing the resume text, job description, and job title, and explicitly instructs Gemini to return only valid JSON in a fixed schema. The `@google/generative-ai` SDK sends this prompt to the model using an API key from environment variables, and the raw text response is cleaned and parsed into a JavaScript object before being saved and returned to the client.

**Q6. What is JWT and why did you use it?**
JWT (JSON Web Token) is a signed, stateless token issued at login that encodes the user's ID. The server verifies its signature on every protected request instead of maintaining server-side session storage, which is simpler to scale and works cleanly with a decoupled frontend/backend architecture.

**Q7. Why did you use MongoDB instead of a relational database?**
The data is naturally document-shaped — a single resume analysis has deeply nested, variable-length fields (skill arrays, interview question objects, a daily roadmap plan) that map directly onto a JSON-like document, which MongoDB stores natively without needing several join tables.

**Q8. How is candidate ranking calculated for recruiters?**
Every uploaded resume is independently analyzed by Gemini against the same job description, producing an `overallMatchPercentage` and `atsScore` per candidate. The ranking endpoint queries all analyses tied to that job, then sorts them by match percentage (or recency) and can filter by score range or role fit.

**Q9. What are the limitations of your project?**
It only supports PDF resumes (no DOCX yet), it depends on a third-party AI API so it inherits that API's rate limits and occasional response variability, resume/AI text is stored in MongoDB in plain form, and there's currently no admin role for platform-wide oversight.

**Q10. What are the future enhancements you'd add?**
DOCX support, an admin role, server-rendered PDF export, email notifications, messaging between recruiters and candidates, and further prompt tuning using real anonymized recruiter feedback to improve scoring accuracy.

**Q11. How do you handle a malformed or unexpected AI response?**
The response is stripped of markdown code fences, then `JSON.parse`d inside a try/catch. If parsing fails, a clean error is returned instead of crashing. If parsing succeeds but fields are missing or the wrong type, every numeric field is clamped to 0–100 and every array/string field defaults to a safe empty value before saving.

**Q12. How do you prevent one user from accessing another user's data?**
Every database query for a user-owned resource (analysis, roadmap, or job) filters by both the resource's ID *and* the requesting user's ID (from the verified JWT), so a user can never fetch, update, or delete a resource they don't own — even if they know or guess its ID.

**Q13. How is the password stored securely?**
Passwords are hashed with bcrypt (with a random salt) before being saved, via a Mongoose pre-save hook. The raw password is never stored, and the hashed field is excluded from query results by default (`select: false`), only pulled in explicitly during login for comparison.

**Q14. What is the difference between authentication and authorization in your app?**
Authentication (the `protect` middleware) verifies *who* the user is by validating their JWT. Authorization (the `authorize('recruiter')` middleware) checks *what* that authenticated user is allowed to do — for example, only users with the `recruiter` role can access job-posting and bulk-analysis routes.

**Q15. Why did you cap the resume file size at 5MB and restrict it to PDF?**
To prevent abuse (very large uploads consuming memory/bandwidth) and because `pdf-parse` only understands the PDF format — accepting other file types would either fail unpredictably or require a completely different parsing pipeline.

**Q16. What happens if one resume in a bulk recruiter upload fails to parse?**
The batch loop processes each file independently inside its own try/catch. A failure on one file is recorded in a `failed` list with a reason, while the rest of the batch continues processing normally — so one bad PDF never blocks the other nine.

**Q17. How does the roadmap generator decide what to teach the candidate?**
It reuses the candidate's own most recent analysis — specifically the missing skills, weaknesses, resume improvement suggestions, and the target job's description — and feeds all of that into a second Gemini prompt asking for a day-by-day plan sized to the candidate's chosen duration (7, 15, or 30 days).

**Q18. How does the Skill Gap Tracker compute priority?**
It counts how many of the candidate's past analyses list each specific skill as missing. A skill missing in 3 or more analyses is marked High priority, 2 is Medium, and 1 is Low — surfacing genuinely recurring gaps rather than one-off mismatches.

**Q19. Why is the analysis report view shared between candidate and recruiter pages instead of duplicated?**
Both roles need to display the exact same `ResumeAnalysis` data shape. Extracting one `AnalysisReportView` component avoids maintaining two copies of the same large UI and guarantees both roles always see a consistent report layout.

**Q20. How do you handle CORS between the frontend and backend?**
The Express backend uses the `cors` middleware configured with an explicit allowed origin read from `CLIENT_URL` in the environment, rather than allowing all origins, so only the configured frontend can call the API with credentials.

**Q21. What is rate limiting and why did you add it?**
`express-rate-limit` caps how many requests a single client can make in a time window. It's applied globally to the API and more strictly to the auth routes specifically, to reduce the risk of brute-force login attempts or abusive automated traffic.

**Q22. How would this system scale to handle many more users?**
The stateless JWT auth model already scales horizontally without shared session storage. The main scaling considerations would be Gemini API rate limits/cost at high volume, and adding pagination to list endpoints (analyses, jobs, rankings) once collections grow large — both are natural next steps rather than architectural blockers.

**Q23. Why did you choose React with TypeScript for the frontend?**
TypeScript catches type mismatches between the frontend and the API response shapes at compile time, which matters a lot in a data-heavy app like this with many nested fields (scores, skill arrays, interview questions, daily plans) — it significantly reduces a whole class of runtime bugs.

**Q24. What testing did you do on this project?**
Manual functional testing of every flow (both roles, register/login/analyze/roadmap/rankings/delete), API-level testing of status codes and error paths, deliberate testing of malformed AI responses to confirm the app doesn't crash, and TypeScript strict-mode compilation with zero errors across the frontend.

**Q25. What was the hardest technical challenge in this project?**
Making the AI integration reliable — LLMs don't always return perfectly clean JSON (they sometimes wrap it in markdown, or omit a field). Building the cleaning/validation layer so the rest of the app can treat the AI's output as a trustworthy, fully-typed object was the trickiest and most important part of the system.

**Q26. How does a recruiter's bulk upload differ technically from a candidate's single upload?**
Both use the same Multer configuration (memory storage, PDF filter, 5MB limit) but the recruiter route uses `.array('resumes', 10)` instead of `.single('resume')`, and the controller loops over each file independently, tagging every resulting `ResumeAnalysis` with the job's ID in addition to the recruiter's user ID.

**Q27. Why store the raw AI response (`rawAIResponse`) in the database in addition to the parsed fields?**
It preserves exactly what the model returned, which is useful for debugging and auditability — if a scoring discrepancy is ever reported, the original AI output can be inspected without needing to re-run the analysis.
