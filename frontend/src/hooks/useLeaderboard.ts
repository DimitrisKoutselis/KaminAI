import { useState, useEffect, useCallback } from 'react'
import { leaderboardService } from '../services/leaderboardService'
import type { LeaderboardResponse } from '../types/leaderboard'

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leaderboardService.getLeaderboard()
      setLeaderboard(data)
    } catch (err) {
      setError('Failed to load leaderboard')
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    refresh: fetchLeaderboard,
  }
}
