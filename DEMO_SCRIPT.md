# Demo Script — CareerFit AI (~5 Minutes)

A simple, presentation-friendly walkthrough for a viva, project review, or portfolio demo. Have `sample-data/fullstack-jd.txt` (or `frontend-jd.txt`/`backend-jd.txt`) and a real resume PDF ready before you start.

---

### 0. Before you start (30 sec setup, off-script)
- Backend running (`cd server && npm run dev`) and MongoDB connected.
- Frontend running (`cd client && npm run dev`), open at `http://localhost:5173`.
- Have one resume PDF and one file from `sample-data/` open and ready to paste/upload.

---

### 1. Open the Landing Page (15 sec)
"This is CareerFit AI — an AI-powered resume screening and job match platform for both candidates and recruiters." Point out the clean landing page and the Register/Login buttons.

### 2. Register as a Candidate (20 sec)
Click **Register** → select **Candidate** → fill in name/email/password → submit. "Notice it redirects straight to the candidate dashboard — the role you pick at registration decides which dashboard and features you see."

### 3. Login (10 sec, optional if already logged in)
If demoing login separately: log out, then log back in with the same credentials to show session persistence.

### 4. Upload a Resume (30 sec)
Go to **Analyze Resume**. Drag in a resume PDF. "The upload is validated on both the browser and the server — PDF only, 5MB max."

### 5. Paste a Job Description (20 sec)
Paste the job title and description from `sample-data/fullstack-jd.txt`. "This is a realistic job posting — nothing here is mock data, it's just sample content for the demo."

### 6. Show the AI Analysis (60 sec)
Submit and wait for the result. Walk through the report: "Here's the ATS score and overall match percentage, computed by Gemini reading both the resume and the job description. Below that, a five-part score breakdown, matched vs. missing skills, strengths and weaknesses, and — this section — the Resume Improvement Report, with prioritized, actionable suggestions and a one-click copy button. At the bottom, AI-generated interview questions targeted at this candidate's weak areas."

### 7. Generate a Roadmap (45 sec)
Click **Generate Roadmap** → pick **7 days** → submit. "This takes the missing skills and weak areas from the analysis we just saw and turns them into a real day-by-day study plan." Scroll through a couple of days, show the final project suggestion, and mention the print/download button.

### 8. Show the Skill Gap Tracker (20 sec)
Navigate to **Skill Gaps**. "This aggregates missing skills across *every* analysis this candidate has ever run — so if 'Docker' keeps showing up as missing across three different job applications, it gets flagged High priority here."

### 9. Register/Login as a Recruiter (20 sec)
Log out, register a second account as **Recruiter** (or switch to an existing recruiter account). "Now let's look at the other side of the platform."

### 10. Create a Job (30 sec)
Go to **Post a Job**, fill in title/company/required skills/description (can reuse a `sample-data/` JD), submit.

### 11. Upload Multiple Resumes (45 sec)
Open the job → **Upload Resumes** → select 2–3 PDF resumes at once → submit. "Up to 10 resumes at once, each analyzed independently against this job description by the same AI engine we just saw on the candidate side."

### 12. Show the Ranking Dashboard (40 sec)
After the upload redirects to the job page, show the ranking table: rank, candidate name, ATS score, match %, role fit, missing skill count. Demonstrate a filter (e.g. "Score 80+") and a sort ("Latest" vs "Highest Match").

### 13. Show Report Download (20 sec)
Click into one candidate's ranking row → open their full report (same view candidates see) → click **Print / Download Report**. "Same shared report component on both sides of the platform — one AI evaluation engine, two dashboards."

---

**Closing line:** "That's CareerFit AI — a full AI-driven loop from resume upload to actionable feedback to a learning plan, and on the recruiter side, from a job posting to a ranked shortlist, all backed by a real database and a real AI model, with no mock data anywhere."
