import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Puzzle, FileSearch } from 'lucide-react';
import * as candidateService from '../../services/candidateService';
import type { SkillGap, SkillGapPriority } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const priorityBadgeTone: Record<SkillGapPriority, 'danger' | 'warning' | 'neutral'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};

export default function SkillGapPage() {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function loadSkillGaps() {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await candidateService.getSkillGaps();
      setSkillGaps(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSkillGaps();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Analyzing your skill gaps..." />;
  }

  if (hasError) {
    return <ErrorState description="We couldn't load your skill gaps." onRetry={loadSkillGaps} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Skill Gap Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Skills that keep showing up as missing across your resume analyses.
        </p>
      </div>

      {skillGaps.length === 0 ? (
        <Card>
          <EmptyState
            icon={Puzzle}
            title="No skill gaps found yet"
            description="Run a few resume analyses and this page will show you which skills you're most often missing."
            action={
              <Link to="/candidate/analyze">
                <Button>
                  <FileSearch size={18} />
                  Analyze a Resume
                </Button>
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
                    <th className="px-6 py-3">Skill</th>
                    <th className="px-6 py-3">Missed In</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Suggested Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skillGaps.map((gap) => (
                    <tr key={gap.skill} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{gap.skill}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {gap.count} analys{gap.count === 1 ? 'is' : 'es'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={priorityBadgeTone[gap.priority]}>{gap.priority}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{gap.suggestedAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {skillGaps.map((gap) => (
              <Card key={gap.skill}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900">{gap.skill}</h3>
                  <Badge tone={priorityBadgeTone[gap.priority]}>{gap.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Missing in {gap.count} analys{gap.count === 1 ? 'is' : 'es'}
                </p>
                <p className="mt-3 text-sm text-slate-600">{gap.suggestedAction}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
