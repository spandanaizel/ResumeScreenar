import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import * as recruiterService from '../../services/recruiterService';
import type { Job } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/helpers';

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadJobs() {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await recruiterService.getJobs();
      setJobs(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(
      `Delete "${title}"? This will also remove all candidate analyses for this job.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const message = await recruiterService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success(message);
    } catch {
      // error toast handled by axios interceptor
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your jobs..." />;
  }

  if (hasError) {
    return <ErrorState description="We couldn't load your jobs." onRetry={loadJobs} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Job Postings</h1>
          <p className="mt-1 text-sm text-slate-500">Jobs you've created and their candidate pipelines.</p>
        </div>
        <Link to="/recruiter/jobs/create">
          <Button>
            <PlusCircle size={18} />
            Create Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create a job posting to start analyzing candidate resumes against it."
            action={
              <Link to="/recruiter/jobs/create">
                <Button>Create Job</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job._id} className="flex h-full flex-col">
              <h3 className="font-bold text-slate-900 line-clamp-1">{job.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-1">{job.companyName}</p>
              {job.location && <p className="mt-1 text-xs text-slate-400">{job.location}</p>}
              <p className="mt-3 text-xs text-slate-400">Posted {formatDate(job.createdAt)}</p>
              <div className="mt-4 flex flex-1 items-end gap-2">
                <Link to={`/recruiter/jobs/${job._id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    <Eye size={14} />
                    View
                  </Button>
                </Link>
                <Link to={`/recruiter/jobs/${job._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil size={14} />
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deletingId === job._id}
                  onClick={() => handleDelete(job._id, job.title)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
