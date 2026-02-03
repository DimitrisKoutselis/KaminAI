import { useState, useMemo } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { RankedSection } from '../components/leaderboard'
import { Card } from '../components/common'
import type { MediaReview } from '../types/leaderboard'

interface CategoryStats {
  name: string
  count: number
  avgRating: number
}

export const LeaderboardPage = () => {
  const { leaderboard, loading, error, refresh } = useLeaderboard()
  const [yearFilter, setYearFilter] = useState<string>('')

  const availableYears = useMemo(() => {
    if (!leaderboard) return []
    const allMedia = [
      ...leaderboard.movies,
      ...leaderboard.series,
      ...leaderboard.games,
      ...leaderboard.books,
    ]
    const years = [...new Set(allMedia.map((m) => m.year).filter(Boolean))]
    return years.sort((a, b) => (b || '').localeCompare(a || ''))
  }, [leaderboard])

  const filterByYear = (reviews: MediaReview[]) => {
    if (!yearFilter) return reviews
    return reviews.filter((r) => r.year === yearFilter)
  }

  const hallOfFame = useMemo(() => {
    if (!leaderboard) return []
    const allMedia = [
      ...leaderboard.movies,
      ...leaderboard.series,
      ...leaderboard.games,
      ...leaderboard.books,
    ]
    return allMedia.filter((m) => m.rating === 10)
  }, [leaderboard])

  const recentlyAdded = useMemo(() => {
    if (!leaderboard) return []
    const allMedia = [
      ...leaderboard.movies,
      ...leaderboard.series,
      ...leaderboard.games,
      ...leaderboard.books,
    ]
    return allMedia
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [leaderboard])

  const categoryStats = useMemo((): CategoryStats[] => {
    if (!leaderboard) return []

    const calcStats = (reviews: MediaReview[], name: string): CategoryStats => ({
      name,
      count: reviews.length,
      avgRating: reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0,
    })

    return [
      calcStats(leaderboard.movies, 'Movies'),
      calcStats(leaderboard.series, 'Series'),
      calcStats(leaderboard.games, 'Games'),
      calcStats(leaderboard.books, 'Books'),
    ]
  }, [leaderboard])

  const totalRatings =
    leaderboard ?
      leaderboard.movies.length +
      leaderboard.series.length +
      leaderboard.games.length +
      leaderboard.books.length
    : 0

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-10 bg-zinc-200 rounded w-1/3 mb-4" />
          <div className="h-6 bg-zinc-200 rounded w-2/3" />
        </div>

        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-zinc-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="aspect-[2/3] bg-zinc-200 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-zinc-600 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="text-zinc-900 hover:text-zinc-700 font-medium"
        >
          Try again
        </button>
      </Card>
    )
  }

  const isEmpty =
    leaderboard &&
    leaderboard.movies.length === 0 &&
    leaderboard.series.length === 0 &&
    leaderboard.games.length === 0 &&
    leaderboard.books.length === 0

  return (
    <div className="space-y-8">
      <Card className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-3">My Ratings</h1>
            <p className="text-lg text-zinc-500">
              What I think about the media I consume.{' '}
              {totalRatings > 0 && (
                <span className="text-zinc-700 font-medium">{totalRatings} total ratings.</span>
              )}
            </p>
          </div>
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="year-filter" className="text-sm text-zinc-600">
                Filter by year:
              </label>
              <select
                id="year-filter"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white"
              >
                <option value="">All years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year || ''}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {categoryStats.length > 0 && categoryStats.some((s) => s.count > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          {categoryStats.map((stat) => (
            <Card key={stat.name} className="text-center py-6">
              <p className="text-3xl font-bold text-zinc-900">{stat.count}</p>
              <p className="text-sm text-zinc-500 mt-1">{stat.name}</p>
              {stat.count > 0 && (
                <p className="text-sm text-zinc-600 font-medium mt-2">
                  Avg: {stat.avgRating}/10
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {hallOfFame.length > 0 && (
        <Card className="animate-slide-up bg-zinc-50 border-zinc-300">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">Hall of Fame</h2>
            <p className="text-zinc-600 mt-1">The best of the best - perfect 10/10 ratings</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {hallOfFame.map((review) => (
              <div
                key={review.id}
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                {review.poster_url ? (
                  <img
                    src={review.poster_url}
                    alt={review.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-zinc-200 flex items-center justify-center">
                    <span className="text-4xl text-zinc-400">?</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white font-semibold text-sm truncate">{review.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-white font-bold text-sm">10/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {recentlyAdded.length > 0 && (
        <Card className="animate-slide-up">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900">Recently Added</h2>
            <p className="text-zinc-600 text-sm mt-1">Latest additions to the leaderboard</p>
          </div>
          <div className="space-y-3">
            {recentlyAdded.map((review) => (
              <div
                key={review.id}
                className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                {review.poster_url ? (
                  <img
                    src={review.poster_url}
                    alt={review.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-zinc-200 rounded flex items-center justify-center">
                    <span className="text-xl text-zinc-400">?</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{review.title}</p>
                  <p className="text-sm text-zinc-500 capitalize">
                    {review.media_type} {review.year && `(${review.year})`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-900">{review.rating}/10</span>
                  <p className="text-xs text-zinc-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isEmpty ? (
        <Card className="text-center py-16 animate-slide-up">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">No ratings yet</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            When I write reviews on my blog and rate movies, series, games, or books, they'll
            appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="animate-slide-up">
          {leaderboard && (
            <>
              <RankedSection
                title="Movies"
                icon=""
                reviews={filterByYear(leaderboard.movies)}
              />
              <RankedSection
                title="Series"
                icon=""
                reviews={filterByYear(leaderboard.series)}
              />
              <RankedSection
                title="Games"
                icon=""
                reviews={filterByYear(leaderboard.games)}
              />
              <RankedSection
                title="Books"
                icon=""
                reviews={filterByYear(leaderboard.books)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
