import api from './api';
import type { PinnedRepo, AvailableRepo } from '../types/pinnedRepo';

export const pinnedRepoService = {
  async getPinnedRepos(): Promise<PinnedRepo[]> {
    const response = await api.get('/pinned-repos');
    return response.data;
  },

  async getAvailableRepos(): Promise<AvailableRepo[]> {
    const response = await api.get('/pinned-repos/available');
    return response.data;
  },

  async pinRepo(repoName: string, displayName?: string): Promise<PinnedRepo> {
    const response = await api.post('/pinned-repos', {
      repo_name: repoName,
      display_name: displayName,
    });
    return response.data;
  },

  async unpinRepo(repoId: string): Promise<void> {
    await api.delete(`/pinned-repos/${repoId}`);
  },

  async reorderRepos(repoIds: string[]): Promise<PinnedRepo[]> {
    const response = await api.put('/pinned-repos/reorder', {
      repo_ids: repoIds,
    });
    return response.data;
  },

  async refreshRepos(): Promise<PinnedRepo[]> {
    const response = await api.post('/pinned-repos/refresh');
    return response.data;
  },
};
