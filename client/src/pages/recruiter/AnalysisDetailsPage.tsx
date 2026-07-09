import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import * as recruiterService from '../../services/recruiterService';
import type { ResumeAnalysis } from '../../types';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import AnalysisReportView from '../../components/analysis/AnalysisReportView';
import { formatDateTime } from '../../utils/helpers';

export default function RecruiterAnalysisDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function loadAnalysis() {
    if (!id) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await recruiterService.getAnalysisById(id);
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

  if (isLoading) {
    return <LoadingSpinner message="Loading candidate analysis..." />;
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

  const backTo = analysis.jobId ? `/recruiter/jobs/${analysis.jobId}` : '/recruiter/jobs';

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in print:max-w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft size={14} />
            Back to Job
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {analysis.candidateName || 'Unknown Candidate'}
          </h1>
          <p className="text-sm text-slate-500">
            {analysis.jobTitle}
            {analysis.companyName ? ` · ${analysis.companyName}` : ''} · {formatDateTime(analysis.createdAt)}
          </p>
        </div>
      </div>

      <AnalysisReportView
        analysis={analysis}
        headerActions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} />
            Print / Download Report
          </Button>
        }
      />
    </div>
  );
}
