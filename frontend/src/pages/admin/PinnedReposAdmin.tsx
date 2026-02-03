import { useState, useEffect } from 'react'
import { Card, Button } from '../../components/common'
import { pinnedRepoService } from '../../services/pinnedRepoService'
import type { PinnedRepo, AvailableRepo } from '../../types/pinnedRepo'

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-500',
  Rust: 'bg-orange-600',
  Go: 'bg-cyan-500',
  Java: 'bg-red-500',
  'C++': 'bg-pink-500',
  C: 'bg-gray-600',
  Ruby: 'bg-red-600',
  PHP: 'bg-indigo-400',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-500',
}

export const PinnedReposAdmin = () => {
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([])
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [pinning, setPinning] = useState<string | null>(null)
  const [unpinning, setUnpinning] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pinned, available] = await Promise.all([
        pinnedRepoService.getPinnedRepos(),
        pinnedRepoService.getAvailableRepos(),
      ])
      setPinnedRepos(pinned)
      setAvailableRepos(available)
    } catch (err) {
      console.error('Error fetching repos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePin = async (repoName: string) => {
    try {
      setPinning(repoName)
      await pinnedRepoService.pinRepo(repoName)
      await fetchData()
    } catch (err) {
      console.error('Error pinning repo:', err)
    } finally {
      setPinning(null)
    }
  }

  const handleUnpin = async (repoId: string) => {
    try {
      setUnpinning(repoId)
      await pinnedRepoService.unpinRepo(repoId)
      await fetchData()
    } catch (err) {
      console.error('Error unpinning repo:', err)
    } finally {
      setUnpinning(null)
    }
  }

  const unpinnedRepos = availableRepos.filter((r) => !r.is_pinned)

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pinned Repositories</h1>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pinned Repositories</h1>
          <p className="text-gray-500 mt-1">
            Select which GitHub repositories to showcase on your homepage
          </p>
        </div>
      </div>

      {/* Currently Pinned */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Currently Pinned ({pinnedRepos.length})
          </h2>
          {pinnedRepos.length > 0 && (
            <span className="text-sm text-gray-500">
              These appear on your homepage
            </span>
          )}
        </div>

        {pinnedRepos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p>No repositories pinned yet</p>
            <p className="text-sm mt-1">Pin some repositories below to showcase them on your homepage</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pinnedRepos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-blue-600 truncate"
                      >
                        {repo.display_name}
                      </a>
                      {repo.language && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <span className={`w-2 h-2 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`} />
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {repo.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 5C7 3.89543 7.89543 3 9 3C10.1046 3 11 3.89543 11 5C11 5.74028 10.5978 6.38663 10 6.73244V14.0396H14.7915C15.2367 13.1292 16.1936 12.5 17.3077 12.5C18.8638 12.5 20.1154 13.7239 20.1154 15.2462C20.1154 16.7685 18.8638 17.9923 17.3077 17.9923C16.1936 17.9923 15.2367 17.3631 14.7915 16.4527H9C8.44772 16.4527 8 16.005 8 15.4527V6.73244C7.40219 6.38663 7 5.74028 7 5Z"/>
                      </svg>
                      {repo.forks}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnpin(repo.id)}
                  disabled={unpinning === repo.id}
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {unpinning === repo.id ? 'Unpinning...' : 'Unpin'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Available Repos */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Repositories ({unpinnedRepos.length})
          </h2>
          <span className="text-sm text-gray-500">
            Click "Pin" to add to homepage
          </span>
        </div>

        {unpinnedRepos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>All repositories are already pinned!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unpinnedRepos.map((repo) => (
              <div
                key={repo.name}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-blue-600 truncate"
                      >
                        {repo.name}
                      </a>
                      {repo.language && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <span className={`w-2 h-2 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`} />
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {repo.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 5C7 3.89543 7.89543 3 9 3C10.1046 3 11 3.89543 11 5C11 5.74028 10.5978 6.38663 10 6.73244V14.0396H14.7915C15.2367 13.1292 16.1936 12.5 17.3077 12.5C18.8638 12.5 20.1154 13.7239 20.1154 15.2462C20.1154 16.7685 18.8638 17.9923 17.3077 17.9923C16.1936 17.9923 15.2367 17.3631 14.7915 16.4527H9C8.44772 16.4527 8 16.005 8 15.4527V6.73244C7.40219 6.38663 7 5.74028 7 5Z"/>
                      </svg>
                      {repo.forks}
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePin(repo.name)}
                  disabled={pinning === repo.name}
                  className="ml-4"
                >
                  {pinning === repo.name ? 'Pinning...' : 'Pin'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
