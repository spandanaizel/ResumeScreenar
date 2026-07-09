import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileStack, TrendingUp, Trophy, PlusCircle, ArrowRight } from 'lucide-react';
import * as recruiterService from '../../services/recruiterService';
import type { Job, ResumeAnalysis } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import { formatDate, getRoleFitClass } from '../../utils/helpers';

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function loadDashboard() {
    setIsLoading(true);
    setHasError(false);
    try {
      const jobsData = await recruiterService.getJobs();
      setJobs(jobsData);

      const rankingsPerJob = await Promise.all(
        jobsData.map((job) => recruiterService.getRankings(job._id))
      );
      setAllAnalyses(rankingsPerJob.flat());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (hasError) {
    return <ErrorState description="We couldn't load your dashboard." onRetry={loadDashboard} />;
  }

  const totalJobs = jobs.length;
  const totalResumes = allAnalyses.length;
  const averageMatch = totalResumes
    ? Math.round(allAnalyses.reduce((sum, a) => sum + a.overallMatchPercentage, 0) / totalResumes)
    : 0;

  const topCandidates = [...allAnalyses]
    .sort((a, b) => b.overallMatchPercentage - a.overallMatchPercentage)
    .slice(0, 5);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Recruiter Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your job postings and candidate matches.</p>
      </div>

      {totalJobs === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Create your first job posting to start analyzing candidate resumes against it."
            action={
              <Link to="/recruiter/jobs/create">
                <Button size="lg">
                  <PlusCircle size={18} />
                  Post a Job
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Briefcase size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Jobs</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalJobs}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileStack size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Resumes Analyzed</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalResumes}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-accent-purple">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Average Match %</p>
                <p className="text-2xl font-extrabold text-slate-900">{averageMatch}%</p>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/recruiter/jobs/create">
              <Button>
                <PlusCircle size={18} />
                Post a Job
              </Button>
            </Link>
            <Link to="/recruiter/jobs">
              <Button variant="outline">
                <Briefcase size={18} />
                View All Jobs
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Trophy size={18} className="text-amber-500" />
                Top Candidates
              </h2>
              <div className="mt-3 space-y-3">
                {topCandidates.length ? (
                  topCandidates.map((candidate) => (
                    <Link
                      key={candidate._id}
                      to={`/recruiter/analysis/${candidate._id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {candidate.candidateName || 'Unknown Candidate'}
                        </p>
                        <p className="text-xs text-slate-500">{candidate.jobTitle}</p>
                      </div>
                      <Badge tone="neutral" className={getRoleFitClass(candidate.roleFit)}>
                        {Math.round(candidate.overallMatchPercentage)}%
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No candidates analyzed yet.</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recent Jobs</h2>
                <Link
                  to="/recruiter/jobs"
                  className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="mt-3 space-y-3">
                {recentJobs.map((job) => (
                  <Link
                    key={job._id}
                    to={`/recruiter/jobs/${job._id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.companyName}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(job.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
