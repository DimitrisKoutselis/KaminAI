
import api from './api';
import type { Project } from '../types/portfolio';

export const portfolioService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/portfolio/projects');
    return response.data;
  },
};
