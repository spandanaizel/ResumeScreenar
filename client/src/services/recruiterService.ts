import api from './api';
import type { BulkAnalyzeResult, CreateJobPayload, Job, RankingFilters, ResumeAnalysis } from '../types';

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const { data } = await api.post<Job>('/recruiter/jobs', payload);
  return data;
}

export async function getJobs(): Promise<Job[]> {
  const { data } = await api.get<Job[]>('/recruiter/jobs');
  return data;
}

export async function getJobById(id: string): Promise<Job> {
  const { data } = await api.get<Job>(`/recruiter/jobs/${id}`);
  return data;
}

export async function updateJob(id: string, payload: CreateJobPayload): Promise<Job> {
  const { data } = await api.put<Job>(`/recruiter/jobs/${id}`, payload);
  return data;
}

export async function deleteJob(id: string): Promise<string> {
  const { data } = await api.delete<{ message: string }>(`/recruiter/jobs/${id}`);
  return data?.message || 'Job deleted successfully';
}

export async function analyzeResumesForJob(jobId: string, files: File[]): Promise<BulkAnalyzeResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append('resumes', file));

  const { data } = await api.post<BulkAnalyzeResult>(
    `/recruiter/jobs/${jobId}/analyze-resumes`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

export async function getRankings(jobId: string, filters: RankingFilters = {}): Promise<ResumeAnalysis[]> {
  const { data } = await api.get<ResumeAnalysis[]>(`/recruiter/jobs/${jobId}/rankings`, {
    params: filters,
  });
  return data;
}

export async function getAnalysisById(id: string): Promise<ResumeAnalysis> {
  const { data } = await api.get<ResumeAnalysis>(`/recruiter/analyses/${id}`);
  return data;
}
