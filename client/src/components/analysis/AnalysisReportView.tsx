import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  CheckCircle2,
  XCircle,
  Tag,
  ThumbsUp,
  ThumbsDown,
  MessageCircleQuestion,
  ChevronDown,
  ClipboardList,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ResumeAnalysis, SkillGapPriority } from '../../types';
import Card from '../ui/Card';
import Badge from '../common/Badge';
import ScoreCircle from '../common/ScoreCircle';
import {
  formatDateTime,
  getRoleFitClass,
  getRecommendationClass,
  getScoreColor,
} from '../../utils/helpers';

function InterviewQuestionCard({
  question,
  reason,
  expectedAnswerHint,
  index,
}: {
  question: string;
  reason: string;
  expectedAnswerHint: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-slate-800">{question}</span>
        </div>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50 px-5 py-4 print:block">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Why it's asked</p>
            <p className="mt-1 text-sm text-slate-600">{reason}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Expected answer hint
            </p>
            <p className="mt-1 text-sm text-slate-600">{expectedAnswerHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Suggestions don't carry an AI-assigned priority, so we derive one from
// position: earlier suggestions are treated as higher priority.
function priorityForIndex(index: number, total: number): SkillGapPriority {
  if (total <= 1) return 'High';
  const ratio = index / total;
  if (ratio < 1 / 3) return 'High';
  if (ratio < 2 / 3) return 'Medium';
  return 'Low';
}

const priorityBadgeTone: Record<SkillGapPriority, 'danger' | 'warning' | 'neutral'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};

interface AnalysisReportViewProps {
  analysis: ResumeAnalysis;
  headerActions?: React.ReactNode;
}

export default function AnalysisReportView({ analysis, headerActions }: AnalysisReportViewProps) {
  const [copied, setCopied] = useState(false);

  const scoreBreakdown = [
    { name: 'Technical Skills', score: analysis.technicalSkillScore },
    { name: 'Experience', score: analysis.experienceScore },
    { name: 'Projects', score: analysis.projectScore },
    { name: 'Education', score: analysis.educationScore },
    { name: 'Keyword Match', score: analysis.keywordMatchScore },
  ];

  const missingKeywords = Array.from(
    new Set([...analysis.missingSkills, ...analysis.recommendedKeywords])
  );

  async function handleCopySuggestions() {
    const lines = [
      `Resume Improvement Report — ${analysis.jobTitle}`,
      '',
      'Missing Keywords:',
      ...missingKeywords.map((k) => `- ${k}`),
      '',
      'Weak Sections:',
      ...analysis.weaknesses.map((w) => `- ${w}`),
      '',
      'Actionable Improvements:',
      ...analysis.resumeImprovementSuggestions.map(
        (s, i) => `- [${priorityForIndex(i, analysis.resumeImprovementSuggestions.length)}] ${s}`
      ),
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      toast.success('Suggestions copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header actions (print button, generate roadmap, etc.) */}
      {headerActions && <div className="flex flex-wrap justify-end gap-3 print:hidden">{headerActions}</div>}

      {/* Print-only header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-extrabold text-slate-900">CareerFit AI — Resume Analysis Report</h1>
        <p className="text-sm text-slate-500">
          {analysis.jobTitle}
          {analysis.companyName ? ` · ${analysis.companyName}` : ''} · {formatDateTime(analysis.createdAt)}
        </p>
        <p className="text-sm text-slate-500">
          Candidate: {analysis.candidateName} ({analysis.candidateEmail})
        </p>
      </div>

      {/* Scores overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 print:grid-cols-3">
        <Card className="flex flex-col items-center">
          <ScoreCircle score={analysis.atsScore} label="ATS Score" size={150} />
        </Card>
        <Card className="flex flex-col items-center">
          <ScoreCircle score={analysis.overallMatchPercentage} label="Overall Match %" size={150} />
        </Card>
        <Card className="flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-semibold text-slate-500">Role Fit</p>
          <Badge className={`text-base px-4 py-1.5 ${getRoleFitClass(analysis.roleFit)}`}>
            {analysis.roleFit}
          </Badge>
        </Card>
      </div>

      {/* Final recommendation */}
      <Card
        className={`border-2 ${getRecommendationClass(analysis.finalRecommendation)
          .split(' ')
          .filter((c) => c.startsWith('border'))
          .join(' ')}`}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Final Recommendation</p>
        <div className="mt-2">
          <Badge className={`text-base px-4 py-1.5 ${getRecommendationClass(analysis.finalRecommendation)}`}>
            {analysis.finalRecommendation}
          </Badge>
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">Summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{analysis.summary}</p>
      </Card>

      {/* Score breakdown chart */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900">Score Breakdown</h2>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {scoreBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Skills */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 print:grid-cols-3">
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Matched Skills
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.matchedSkills.length ? (
              analysis.matchedSkills.map((skill) => (
                <Badge key={skill} tone="success">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-400">No matched skills found.</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <XCircle size={18} className="text-amber-500" />
            Missing Skills
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.missingSkills.length ? (
              analysis.missingSkills.map((skill) => (
                <Badge key={skill} tone="warning">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-400">No missing skills — great job!</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Tag size={18} className="text-primary-500" />
            Recommended Keywords
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.recommendedKeywords.length ? (
              analysis.recommendedKeywords.map((keyword) => (
                <Badge key={keyword} tone="primary">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-400">No recommended keywords.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ThumbsUp size={18} className="text-emerald-500" />
            Strengths
          </h2>
          <ul className="mt-3 space-y-2">
            {analysis.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ThumbsDown size={18} className="text-red-500" />
            Weaknesses
          </h2>
          <ul className="mt-3 space-y-2">
            {analysis.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Resume Improvement Report */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ClipboardList size={18} className="text-accent-purple" />
            Resume Improvement Report
          </h2>
          <button
            type="button"
            onClick={handleCopySuggestions}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 print:hidden"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Suggestions'}
          </button>
        </div>

        <div className="mt-4 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Missing Keywords</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingKeywords.length ? (
                missingKeywords.map((keyword) => (
                  <Badge key={keyword} tone="warning">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">No missing keywords found.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Weak Sections</p>
            <ul className="mt-2 space-y-1.5">
              {analysis.weaknesses.length ? (
                analysis.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600">
                    • {item}
                  </li>
                ))
              ) : (
                <p className="text-sm text-slate-400">No weak sections identified.</p>
              )}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Actionable Improvements
            </p>
            <ul className="mt-2 space-y-2">
              {analysis.resumeImprovementSuggestions.length ? (
                analysis.resumeImprovementSuggestions.map((item, i) => {
                  const priority = priorityForIndex(i, analysis.resumeImprovementSuggestions.length);
                  return (
                    <li key={i} className="flex items-start justify-between gap-3 text-sm text-slate-600">
                      <span>{item}</span>
                      <Badge tone={priorityBadgeTone[priority]} className="flex-shrink-0">
                        {priority}
                      </Badge>
                    </li>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">No improvement suggestions.</p>
              )}
            </ul>
          </div>
        </div>
      </Card>

      {/* Interview questions */}
      <Card>
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <MessageCircleQuestion size={18} className="text-primary-500" />
          Interview Questions
        </h2>
        <div className="mt-4 space-y-3">
          {analysis.interviewQuestions.map((q, i) => (
            <InterviewQuestionCard
              key={i}
              index={i}
              question={q.question}
              reason={q.reason}
              expectedAnswerHint={q.expectedAnswerHint}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
