import { useState, useEffect, useCallback } from 'react'
import { pinnedRepoService } from '../services/pinnedRepoService'
import type { PinnedRepo } from '../types/pinnedRepo'

export const usePinnedRepos = () => {
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPinnedRepos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await pinnedRepoService.getPinnedRepos()
      setPinnedRepos(data)
    } catch (err) {
      setError('Failed to load pinned repos')
      console.error('Error fetching pinned repos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPinnedRepos()
  }, [fetchPinnedRepos])

  return {
    pinnedRepos,
    loading,
    error,
    refresh: fetchPinnedRepos,
  }
}
