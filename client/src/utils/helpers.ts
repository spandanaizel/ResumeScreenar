// Small shared helper utilities: score colors, date formatting, etc.

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/** Returns a Tailwind color token bucket based on a 0-100 score. */
export function getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

export function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case 'excellent':
      return '#10b981'; // emerald-500
    case 'good':
      return '#6366f1'; // primary-500
    case 'average':
      return '#f59e0b'; // amber-500
    case 'poor':
      return '#ef4444'; // red-500
  }
}

export function getScoreTextClass(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case 'excellent':
      return 'text-emerald-600';
    case 'good':
      return 'text-primary-600';
    case 'average':
      return 'text-amber-600';
    case 'poor':
      return 'text-red-600';
  }
}

export function getScoreBgClass(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case 'excellent':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'good':
      return 'bg-primary-50 text-primary-700 border-primary-200';
    case 'average':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'poor':
      return 'bg-red-50 text-red-700 border-red-200';
  }
}

export function getRoleFitClass(roleFit: string): string {
  const normalized = roleFit.toLowerCase();
  if (normalized.includes('excellent')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (normalized.includes('good')) return 'bg-primary-100 text-primary-800 border-primary-300';
  if (normalized.includes('average')) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (normalized.includes('poor')) return 'bg-red-100 text-red-800 border-red-300';
  return 'bg-slate-100 text-slate-800 border-slate-300';
}

export function getRecommendationClass(recommendation: string): string {
  const normalized = recommendation.toLowerCase();
  if (normalized.includes('strong shortlist')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (normalized.includes('shortlist')) return 'bg-primary-100 text-primary-800 border-primary-300';
  if (normalized.includes('needs improvement')) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (normalized.includes('not recommended')) return 'bg-red-100 text-red-800 border-red-300';
  return 'bg-slate-100 text-slate-800 border-slate-300';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
