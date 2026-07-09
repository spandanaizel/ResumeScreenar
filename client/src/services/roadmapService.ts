import api from './api';
import type { Roadmap, RoadmapDuration } from '../types';

export async function createRoadmap(analysisId: string, duration: RoadmapDuration): Promise<Roadmap> {
  const { data } = await api.post<Roadmap>(`/candidate/roadmap/${analysisId}`, { duration });
  return data;
}

export async function getRoadmaps(): Promise<Roadmap[]> {
  const { data } = await api.get<Roadmap[]>('/candidate/roadmaps');
  return data;
}

export async function getRoadmapById(id: string): Promise<Roadmap> {
  const { data } = await api.get<Roadmap>(`/candidate/roadmaps/${id}`);
  return data;
}

export async function deleteRoadmap(id: string): Promise<string> {
  const { data } = await api.delete<{ message: string }>(`/candidate/roadmaps/${id}`);
  return data?.message || 'Roadmap deleted successfully';
}
