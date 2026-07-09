import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Printer, Map, Loader2 } from 'lucide-react';
import * as candidateService from '../../services/candidateService';
import * as roadmapService from '../../services/roadmapService';
import type { ResumeAnalysis, RoadmapDuration } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import AnalysisReportView from '../../components/analysis/AnalysisReportView';
import { formatDateTime } from '../../utils/helpers';

const DURATIONS: RoadmapDuration[] = ['7 days', '15 days', '30 days'];

export default function AnalysisDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<RoadmapDuration>('7 days');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  async function loadAnalysis() {
    if (!id) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await candidateService.getAnalysisById(id);
      setAnalysis(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleGenerateRoadmap() {
    if (!id) return;
    setIsGeneratingRoadmap(true);
    try {
      const roadmap = await roadmapService.createRoadmap(id, selectedDuration);
      toast.success('Roadmap generated!');
      navigate(`/candidate/roadmap/${roadmap._id}`);
    } catch {
      // error toast handled by axios interceptor
    } finally {
      setIsGeneratingRoadmap(false);
      setShowRoadmapModal(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading analysis..." />;
  }

  if (hasError || !analysis) {
    return (
      <ErrorState
        title="Analysis not found"
        description="This analysis may have been deleted or the link is invalid."
        onRetry={loadAnalysis}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in print:max-w-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <Link
            to="/candidate/history"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft size={14} />
            Back to History
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">{analysis.jobTitle}</h1>
          <p className="text-sm text-slate-500">
            {analysis.companyName ? `${analysis.companyName} · ` : ''}
            {formatDateTime(analysis.createdAt)}
          </p>
        </div>
      </div>

      <AnalysisReportView
        analysis={analysis}
        headerActions={
          <>
            <Button variant="outline" onClick={() => setShowRoadmapModal(true)}>
              <Map size={16} />
              Generate Roadmap
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} />
              Print / Download Report
            </Button>
          </>
        }
      />

      {showRoadmapModal && (
        <Modal title="Generate Learning Roadmap" onClose={() => setShowRoadmapModal(false)}>
          <p className="text-sm text-slate-500">
            Choose how long you want your personalized learning roadmap to run for.
          </p>
          <div className="mt-4 space-y-2">
            {DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  selectedDuration === duration
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
          <Card className="mt-4 bg-slate-50" padded={false}>
            <div className="p-3 text-center">
              <Button
                fullWidth
                onClick={handleGenerateRoadmap}
                disabled={isGeneratingRoadmap}
                isLoading={isGeneratingRoadmap}
              >
                {isGeneratingRoadmap ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  'Generate Roadmap'
                )}
              </Button>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  );
}
