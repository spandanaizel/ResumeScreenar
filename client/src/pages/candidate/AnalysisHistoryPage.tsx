import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, FileSearch, PlusCircle } from 'lucide-react';
import * as candidateService from '../../services/candidateService';
import type { ResumeAnalysis } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatDate, getRoleFitClass, getScoreTextClass } from '../../utils/helpers';

export default function AnalysisHistoryPage() {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(id: string, jobTitle: string) {
    const confirmed = window.confirm(
      `Delete the analysis for "${jobTitle}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const message = await candidateService.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
      toast.success(message);
    } catch {
      // error toast handled by axios interceptor
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your analysis history..." />;
  }

  if (hasError) {
    return <ErrorState description="We couldn't load your history." onRetry={loadAnalyses} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Analysis History</h1>
          <p className="mt-1 text-sm text-slate-500">All the resume analyses you've run so far.</p>
        </div>
        <Link to="/candidate/analyze">
          <Button>
            <PlusCircle size={18} />
            New Analysis
          </Button>
        </Link>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileSearch}
            title="No analyses yet"
            description="Your analysis history will show up here once you run your first resume match."
            action={
              <Link to="/candidate/analyze">
                <Button>Analyze a Resume</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card padded={false} className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Job Title</th>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">ATS Score</th>
                    <th className="px-6 py-3">Match %</th>
                    <th className="px-6 py-3">Role Fit</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analyses.map((analysis) => (
                    <tr key={analysis._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{analysis.jobTitle}</td>
                      <td className="px-6 py-4 text-slate-500">{analysis.companyName || '—'}</td>
                      <td className={`px-6 py-4 font-bold ${getScoreTextClass(analysis.atsScore)}`}>
                        {Math.round(analysis.atsScore)}
                      </td>
                      <td
                        className={`px-6 py-4 font-bold ${getScoreTextClass(
                          analysis.overallMatchPercentage
                        )}`}
                      >
                        {Math.round(analysis.overallMatchPercentage)}%
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleFitClass(analysis.roleFit)}>{analysis.roleFit}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(analysis.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/candidate/analysis/${analysis._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye size={14} />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={deletingId === analysis._id}
                            onClick={() => handleDelete(analysis._id, analysis.jobTitle)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {analyses.map((analysis) => (
              <Card key={analysis._id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{analysis.jobTitle}</h3>
                    <p className="text-sm text-slate-500">{analysis.companyName || '—'}</p>
                  </div>
                  <Badge className={getRoleFitClass(analysis.roleFit)}>{analysis.roleFit}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-400">ATS Score</p>
                    <p className={`text-lg font-extrabold ${getScoreTextClass(analysis.atsScore)}`}>
                      {Math.round(analysis.atsScore)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Match</p>
                    <p
                      className={`text-lg font-extrabold ${getScoreTextClass(
                        analysis.overallMatchPercentage
                      )}`}
                    >
                      {Math.round(analysis.overallMatchPercentage)}%
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 ml-auto">{formatDate(analysis.createdAt)}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/candidate/analysis/${analysis._id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>
                      <Eye size={14} />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth
                    isLoading={deletingId === analysis._id}
                    onClick={() => handleDelete(analysis._id, analysis.jobTitle)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
