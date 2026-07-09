import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, Map, PlusCircle } from 'lucide-react';
import * as roadmapService from '../../services/roadmapService';
import type { Roadmap } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/helpers';

function jobTitleOf(roadmap: Roadmap): string {
  if (typeof roadmap.analysisId === 'string') return '—';
  return roadmap.analysisId?.jobTitle || '—';
}

export default function RoadmapsListPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadRoadmaps() {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await roadmapService.getRoadmaps();
      setRoadmaps(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmaps();
  }, []);

  async function handleDelete(id: string, goal: string) {
    const confirmed = window.confirm(`Delete the roadmap "${goal}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const message = await roadmapService.deleteRoadmap(id);
      setRoadmaps((prev) => prev.filter((r) => r._id !== id));
      toast.success(message);
    } catch {
      // error toast handled by axios interceptor
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your roadmaps..." />;
  }

  if (hasError) {
    return <ErrorState description="We couldn't load your roadmaps." onRetry={loadRoadmaps} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Learning Roadmaps</h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-generated learning plans based on your resume analyses.
          </p>
        </div>
        <Link to="/candidate/history">
          <Button>
            <PlusCircle size={18} />
            Generate from an Analysis
          </Button>
        </Link>
      </div>

      {roadmaps.length === 0 ? (
        <Card>
          <EmptyState
            icon={Map}
            title="No roadmaps yet"
            description="Open one of your resume analyses and click 'Generate Roadmap' to get a personalized learning plan."
            action={
              <Link to="/candidate/history">
                <Button>View Analysis History</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <Card key={roadmap._id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="primary">{roadmap.duration}</Badge>
                <span className="text-xs text-slate-400">{formatDate(roadmap.createdAt)}</span>
              </div>
              <h3 className="mt-3 font-bold text-slate-900 line-clamp-2">{roadmap.goal}</h3>
              <p className="mt-1 text-sm text-slate-500 line-clamp-1">For: {jobTitleOf(roadmap)}</p>
              <div className="mt-4 flex flex-1 items-end gap-2">
                <Link to={`/candidate/roadmap/${roadmap._id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    <Eye size={14} />
                    View
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={deletingId === roadmap._id}
                  onClick={() => handleDelete(roadmap._id, roadmap.goal)}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
