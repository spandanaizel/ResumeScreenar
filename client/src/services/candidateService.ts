import api from './api';
import type { AnalyzeResumePayload, ResumeAnalysis, SkillGap } from '../types';

interface AnalysesListWrapped {
  analyses: ResumeAnalysis[];
}

interface AnalysisWrapped {
  analysis: ResumeAnalysis;
}

interface MessageResponse {
  message: string;
}

// Defensive unwrap helpers: backend may return arrays/objects bare or
// wrapped in { analyses: [...] } / { analysis: {...} }.
function unwrapAnalysesList(data: ResumeAnalysis[] | AnalysesListWrapped): ResumeAnalysis[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'analyses' in data) {
    return data.analyses;
  }
  return [];
}

function unwrapAnalysis(data: ResumeAnalysis | AnalysisWrapped): ResumeAnalysis {
  if (data && typeof data === 'object' && 'analysis' in data) {
    return (data as AnalysisWrapped).analysis;
  }
  return data as ResumeAnalysis;
}

export async function analyzeResume(payload: AnalyzeResumePayload): Promise<ResumeAnalysis> {
  const formData = new FormData();
  formData.append('resume', payload.resume);
  formData.append('jobDescription', payload.jobDescription);
  formData.append('jobTitle', payload.jobTitle);
  if (payload.companyName) {
    formData.append('companyName', payload.companyName);
  }

  const { data } = await api.post<ResumeAnalysis | AnalysisWrapped>('/candidate/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapAnalysis(data);
}

export async function getAnalyses(): Promise<ResumeAnalysis[]> {
  const { data } = await api.get<ResumeAnalysis[] | AnalysesListWrapped>('/candidate/analyses');
  return unwrapAnalysesList(data);
}

export async function getAnalysisById(id: string): Promise<ResumeAnalysis> {
  const { data } = await api.get<ResumeAnalysis | AnalysisWrapped>(`/candidate/analyses/${id}`);
  return unwrapAnalysis(data);
}

export async function deleteAnalysis(id: string): Promise<string> {
  const { data } = await api.delete<MessageResponse>(`/candidate/analyses/${id}`);
  return data?.message || 'Analysis deleted successfully';
}

export async function getSkillGaps(): Promise<SkillGap[]> {
  const { data } = await api.get<SkillGap[]>('/candidate/skill-gaps');
  return data;
}
