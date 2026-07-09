import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Target, Rocket, BookOpen, CheckSquare } from 'lucide-react';
import * as roadmapService from '../../services/roadmapService';
import type { Roadmap } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatDate } from '../../utils/helpers';

export default function RoadmapDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function loadRoadmap() {
    if (!id) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await roadmapService.getRoadmapById(id);
      setRoadmap(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading roadmap..." />;
  }

  if (hasError || !roadmap) {
    return (
      <ErrorState
        title="Roadmap not found"
        description="This roadmap may have been deleted or the link is invalid."
        onRetry={loadRoadmap}
      />
    );
  }

  const jobTitle = typeof roadmap.analysisId === 'string' ? null : roadmap.analysisId?.jobTitle;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in print:max-w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <Link
            to="/candidate/roadmaps"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft size={14} />
            Back to Roadmaps
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">{roadmap.duration} Learning Roadmap</h1>
          <p className="text-sm text-slate-500">
            {jobTitle ? `For: ${jobTitle} · ` : ''}
            {formatDate(roadmap.createdAt)}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={16} />
          Print / Download
        </Button>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-extrabold text-slate-900">CareerFit AI — Learning Roadmap</h1>
        <p className="text-sm text-slate-500">
          {roadmap.duration}
          {jobTitle ? ` · For: ${jobTitle}` : ''} · {formatDate(roadmap.createdAt)}
        </p>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Target size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Goal</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{roadmap.goal}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {roadmap.dailyPlan.map((day) => (
          <Card key={day.day}>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {day.day}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{day.topic}</h3>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <CheckSquare size={13} />
                      Tasks
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {day.tasks.map((task, i) => (
                        <li key={i} className="text-sm text-slate-600">
                          • {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <BookOpen size={13} />
                      Resources
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {day.resources.map((resource, i) => (
                        <li key={i} className="text-sm text-slate-600">
                          • {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Expected Outcome
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{day.expectedOutcome}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-accent-purple/30 bg-purple-50/50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-purple/10 text-accent-purple">
            <Rocket size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Final Project Suggestion
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">{roadmap.finalProjectSuggestion}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
