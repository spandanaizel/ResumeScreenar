import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  TrendingUp,
  Award,
  History,
  ArrowRight,
  PlusCircle,
  Trophy,
  Tags,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import * as candidateService from '../../services/candidateService';
import type { ResumeAnalysis } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { formatDate, getRoleFitClass, getScoreTextClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_COLORS = {
  Excellent: '#10b981',
  Good: '#6366f1',
  'Needs Improvement': '#ef4444',
};

function topSkillCounts(analyses: ResumeAnalysis[], field: 'missingSkills' | 'recommendedKeywords', limit = 5) {
  const counts: Record<string, number> = {};
  analyses.forEach((a) => {
    a[field].forEach((skill) => {
      const key = skill.trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function loadAnalyses() {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await candidateService.getAnalyses();
      setAnalyses(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalyses();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (hasError) {
    return <ErrorState description="We couldn't load your analyses." onRetry={loadAnalyses} />;
  }

  const totalAnalyses = analyses.length;
  const averageAts = totalAnalyses
    ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / totalAnalyses)
    : 0;
  const highestAts = totalAnalyses ? Math.round(Math.max(...analyses.map((a) => a.atsScore))) : 0;
  const highestMatch = totalAnalyses
    ? Math.round(Math.max(...analyses.map((a) => a.overallMatchPercentage)))
    : 0;
  const recentAnalyses = analyses.slice(0, 5);

  const topMissingSkills = topSkillCounts(analyses, 'missingSkills');
  const topRecommendedKeywords = topSkillCounts(analyses, 'recommendedKeywords');

  // Oldest -> newest, so the trend line reads left to right chronologically.
  const trendData = [...analyses]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((a, index) => ({
      name: `#${index + 1}`,
      date: formatDate(a.createdAt),
      atsScore: Math.round(a.atsScore),
      matchPercentage: Math.round(a.overallMatchPercentage),
    }));

  const categoryDistribution = [
    { name: 'Excellent', value: analyses.filter((a) => a.atsScore >= 80).length },
    { name: 'Good', value: analyses.filter((a) => a.atsScore >= 60 && a.atsScore < 80).length },
    { name: 'Needs Improvement', value: analyses.filter((a) => a.atsScore < 60).length },
  ].filter((c) => c.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500">Here's an overview of your resume analysis activity.</p>
      </div>

      {totalAnalyses === 0 ? (
        <Card>
          <EmptyState
            icon={FileSearch}
            title="No analyses yet"
            description="Upload your resume and a job description to get your first AI-powered match report."
            action={
              <Link to="/candidate/analyze">
                <Button size="lg">
                  <PlusCircle size={18} />
                  Analyze Your First Resume
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <FileSearch size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Analyses</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalAnalyses}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Award size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Average ATS Score</p>
                <p className="text-2xl font-extrabold text-slate-900">{averageAts}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Highest ATS Score</p>
                <p className="text-2xl font-extrabold text-slate-900">{highestAts}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-accent-purple">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Highest Match %</p>
                <p className="text-2xl font-extrabold text-slate-900">{highestMatch}%</p>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/candidate/analyze">
              <Button>
                <PlusCircle size={18} />
                Analyze Resume
              </Button>
            </Link>
            <Link to="/candidate/history">
              <Button variant="outline">
                <History size={18} />
                View History
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h2 className="text-base font-bold text-slate-900">Score Trend</h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="atsScore"
                      name="ATS Score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="matchPercentage"
                      name="Match %"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className="text-base font-bold text-slate-900">Score Distribution</h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {categoryDistribution.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Tags size={18} className="text-amber-500" />
                Most Common Missing Skills
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {topMissingSkills.length ? (
                  topMissingSkills.map(([skill, count]) => (
                    <Badge key={skill} tone="warning">
                      {skill} · {count}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No missing skills recorded yet.</p>
                )}
              </div>
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Tags size={18} className="text-primary-500" />
                Most Common Recommended Keywords
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {topRecommendedKeywords.length ? (
                  topRecommendedKeywords.map(([keyword, count]) => (
                    <Badge key={keyword} tone="primary">
                      {keyword} · {count}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No recommended keywords recorded yet.</p>
                )}
              </div>
            </Card>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Analyses</h2>
              <Link
                to="/candidate/history"
                className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentAnalyses.map((analysis) => (
                <Link key={analysis._id} to={`/candidate/analysis/${analysis._id}`}>
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{analysis.jobTitle}</h3>
                        {analysis.companyName && (
                          <p className="text-sm text-slate-500 line-clamp-1">{analysis.companyName}</p>
                        )}
                      </div>
                      <Badge tone="neutral" className={getRoleFitClass(analysis.roleFit)}>
                        {analysis.roleFit}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-400">ATS Score</p>
                        <p className={`text-xl font-extrabold ${getScoreTextClass(analysis.atsScore)}`}>
                          {Math.round(analysis.atsScore)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Match</p>
                        <p
                          className={`text-xl font-extrabold ${getScoreTextClass(
                            analysis.overallMatchPercentage
                          )}`}
                        >
                          {Math.round(analysis.overallMatchPercentage)}%
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">{formatDate(analysis.createdAt)}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
