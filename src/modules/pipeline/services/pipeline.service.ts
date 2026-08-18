import api from '@/utils/api';
import { PipelineIdea, PaginatedIdeas, PipelineComment } from '../types/pipeline.types';

export const fetchPipelineIdeas = async (
  search: string = '',
  departmentId: string = '',
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedIdeas> => {
  const response = await api.get('/pipeline', {
    params: { search, departmentId, limit, offset },
  });
  return response.data;
};

export const fetchPipelineIdea = async (id: string): Promise<PipelineIdea> => {
  const response = await api.get(`/pipeline/${id}`);
  return response.data;
};

export const createPipelineIdea = async (formData: FormData) => {
  const response = await api.post('/pipeline', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const reactToIdea = async (ideaId: string, emoji: string) => {
  const response = await api.post(`/pipeline/${ideaId}/react`, { emoji });
  return response.data;
};

export const addComment = async (ideaId: string, formData: FormData): Promise<PipelineComment> => {
  const response = await api.post(`/pipeline/${ideaId}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const reactToComment = async (commentId: string, emoji: string) => {
  const response = await api.post(`/pipeline/comments/${commentId}/react`, { emoji });
  return response.data;
};

export const updatePipelineIdea = async (ideaId: string, formData: FormData) => {
  const response = await api.patch(`/pipeline/${ideaId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePipelineIdea = async (ideaId: string) => {
  const response = await api.delete(`/pipeline/${ideaId}`);
  return response.data;
};
