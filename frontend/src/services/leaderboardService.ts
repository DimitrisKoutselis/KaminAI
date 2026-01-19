import api from './api'
import type { LeaderboardResponse, MediaReviewListResponse, MediaReview, MediaReviewCreate } from '../types/leaderboard'

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardResponse> {
    const response = await api.get('/leaderboard')
    return response.data
  },

  async getReviewsByType(mediaType: string): Promise<MediaReviewListResponse> {
    const response = await api.get(`/leaderboard/type/${mediaType}`)
    return response.data
  },

  async extractReviews(articleId: string): Promise<MediaReviewListResponse> {
    const response = await api.post(`/leaderboard/extract/${articleId}`)
    return response.data
  },

  async createReview(review: MediaReviewCreate): Promise<MediaReview> {
    const response = await api.post('/leaderboard', review)
    return response.data
  },
}
