import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Eye, FileSearch } from 'lucide-react';
import * as recruiterService from '../../services/recruiterService';
import type { Job, RankingFilters, ResumeAnalysis } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { getRoleFitClass, getScoreTextClass } from '../../utils/helpers';

const SCORE_BUCKETS: { label: string; filters: Pick<RankingFilters, 'minScore' | 'maxScore'> }[] = [
  { label: 'All Scores', filters: {} },
  { label: '80+', filters: { minScore: 80 } },
  { label: '60-79', filters: { minScore: 60, maxScore: 79 } },
  { label: 'Below 60', filters: { maxScore: 59 } },
];

const ROLE_FIT_OPTIONS = ['All Role Fits', 'Excellent Fit', 'Good Fit', 'Average Fit', 'Poor Fit'];

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [rankings, setRankings] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [scoreBucket, setScoreBucket] = useState(0);
  const [roleFit, setRoleFit] = useState(ROLE_FIT_OPTIONS[0]);
  const [sortBy, setSortBy] = useState<'highestMatch' | 'latest'>('highestMatch');

  const loadRankings = useCallback(async () => {
    if (!id) return;
    setIsLoadingRankings(true);
    try {
      const filters: RankingFilters = {
        ...SCORE_BUCKETS[scoreBucket].filters,
        sortBy,
        ...(roleFit !== ROLE_FIT_OPTIONS[0] ? { roleFit } : {}),
      };
      const data = await recruiterService.getRankings(id, filters);
      setRankings(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoadingRankings(false);
    }
  }, [id, scoreBucket, roleFit, sortBy]);

  async function loadJob() {
    if (!id) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const jobData = await recruiterService.getJobById(id);
      setJob(jobData);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  if (isLoading) {
    return <LoadingSpinner message="Loading job details..." />;
  }

  if (hasError || !job) {
    return (
      <ErrorState
        title="Job not found"
        description="This job may have been deleted or the link is invalid."
        onRetry={loadJob}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/recruiter/jobs"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft size={14} />
            Back to Jobs
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">{job.title}</h1>
          <p className="text-sm text-slate-500">
            {job.companyName}
            {job.location ? ` · ${job.location}` : ''}
          </p>
        </div>
        <Link to={`/recruiter/jobs/${job._id}/upload-resumes`}>
          <Button>
            <UploadCloud size={18} />
            Upload Resumes
          </Button>
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {job.jobType && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Job Type</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{job.jobType}</p>
            </div>
          )}
          {job.experienceLevel && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Experience</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{job.experienceLevel}</p>
            </div>
          )}
          {job.minimumEducation && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Min. Education</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{job.minimumEducation}</p>
            </div>
          )}
          {job.salaryRange && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Salary Range</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{job.salaryRange}</p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Description</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{job.description}</p>
        </div>

        {job.requiredSkills.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Required Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill} tone="primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {job.preferredSkills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Preferred Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.preferredSkills.map((skill) => (
                <Badge key={skill} tone="neutral">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Candidate Rankings</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={scoreBucket}
              onChange={(e) => setScoreBucket(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              {SCORE_BUCKETS.map((bucket, index) => (
                <option key={bucket.label} value={index}>
                  {bucket.label}
                </option>
              ))}
            </select>
            <select
              value={roleFit}
              onChange={(e) => setRoleFit(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              {ROLE_FIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'highestMatch' | 'latest')}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              <option value="highestMatch">Sort: Highest Match</option>
              <option value="latest">Sort: Latest</option>
            </select>
          </div>
        </div>

        {isLoadingRankings ? (
          <LoadingSpinner message="Loading rankings..." />
        ) : rankings.length === 0 ? (
          <Card>
            <EmptyState
              icon={FileSearch}
              title="No candidates match these filters"
              description="Upload resumes for this job, or adjust your filters to see more candidates."
              action={
                <Link to={`/recruiter/jobs/${job._id}/upload-resumes`}>
                  <Button>Upload Resumes</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">ATS Score</th>
                    <th className="px-6 py-3">Match %</th>
                    <th className="px-6 py-3">Role Fit</th>
                    <th className="px-6 py-3">Missing Skills</th>
                    <th className="px-6 py-3">Recommendation</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((candidate, index) => (
                    <tr key={candidate._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-500">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {candidate.candidateName || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">{candidate.candidateEmail || '—'}</p>
                      </td>
                      <td className={`px-6 py-4 font-bold ${getScoreTextClass(candidate.atsScore)}`}>
                        {Math.round(candidate.atsScore)}
                      </td>
                      <td
                        className={`px-6 py-4 font-bold ${getScoreTextClass(candidate.overallMatchPercentage)}`}
                      >
                        {Math.round(candidate.overallMatchPercentage)}%
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleFitClass(candidate.roleFit)}>{candidate.roleFit}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{candidate.missingSkills.length}</td>
                      <td className="px-6 py-4 text-slate-500">{candidate.finalRecommendation}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Link to={`/recruiter/analysis/${candidate._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye size={14} />
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
