import { Link } from 'react-router-dom';
import {
  FileSearch,
  Target,
  Brain,
  BarChart3,
  MessageSquareText,
  Sparkles,
  UploadCloud,
  ClipboardList,
  Wand2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'ATS Score Analysis',
    description: 'Get an instant Applicant Tracking System score that shows how well your resume parses and ranks.',
  },
  {
    icon: Target,
    title: 'Job Match Percentage',
    description: 'See exactly how closely your resume aligns with a specific job description, skill by skill.',
  },
  {
    icon: Brain,
    title: 'AI Skill Gap Detection',
    description: 'Discover matched skills, missing skills, and recommended keywords to add to your resume.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Score Breakdown',
    description: 'Visual breakdown across technical skills, experience, projects, education, and keyword match.',
  },
  {
    icon: MessageSquareText,
    title: 'Interview Question Prep',
    description: 'AI-generated interview questions tailored to your resume and the target role, with answer hints.',
  },
  {
    icon: Sparkles,
    title: 'Improvement Suggestions',
    description: 'Actionable, personalized suggestions to strengthen your resume before you hit apply.',
  },
];

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload your resume',
    description: 'Drop in your resume as a PDF — no formatting hassle, no sign-up friction.',
  },
  {
    icon: ClipboardList,
    title: 'Paste the job description',
    description: 'Add the job title, company, and the full job description you are applying to.',
  },
  {
    icon: Wand2,
    title: 'Get an instant AI analysis',
    description: 'Our AI compares both and generates a full report in seconds — powered by real analysis, not guesswork.',
  },
  {
    icon: GraduationCap,
    title: 'Improve & apply with confidence',
    description: 'Use the tailored suggestions and interview prep to apply as the strongest version of your candidacy.',
  },
];

const studentBenefits = [
  'No résumé-writing experience required — get expert-level feedback instantly',
  'Understand exactly which skills recruiters and ATS systems are scanning for',
  'Practice with AI-generated interview questions before the real thing',
  'Track every analysis you run and watch your match scores improve over time',
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-purple/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700">
            <Sparkles size={14} />
            AI-Powered Resume Intelligence
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            CareerFit AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl font-semibold text-primary-700 sm:text-2xl">
            AI-Powered Resume Screening and Job Match Analyzer
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
            Upload your resume, compare it with job descriptions, get ATS scores, skill gaps, interview
            questions, and personalized improvement suggestions.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-700 hover:shadow-lg transition-all"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything you need to land the interview
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            A single AI-driven report that tells you exactly where your resume stands — and how to make
            it stronger.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple text-white shadow-sm">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              From upload to insight in under a minute.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon size={26} />
                </div>
                <div className="mx-auto mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it helps students */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Built for students entering the job market
            </h2>
            <p className="mt-4 text-slate-500">
              CareerFit AI gives students and early-career candidates the same resume intelligence tools
              that recruiters and career coaches use — for free, instantly, and on your own time.
            </p>
            <ul className="mt-6 space-y-3">
              {studentBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-accent-emerald" />
                  <span className="text-sm text-slate-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-accent-purple p-8 text-white shadow-card">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-100">
                Sample Report Preview
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span className="text-sm">ATS Score</span>
                  <span className="text-lg font-bold">87 / 100</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span className="text-sm">Overall Match</span>
                  <span className="text-lg font-bold">82%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span className="text-sm">Role Fit</span>
                  <span className="text-lg font-bold">Good Fit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-primary-950 px-8 py-16 text-center shadow-card">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to see how your resume measures up?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Create a free account and get your first AI-powered resume analysis in minutes.
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary-700 shadow-md hover:bg-slate-100 transition-all"
            >
              Get Started for Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
