import { useLeaderboard } from '../hooks/useLeaderboard'
import { RankedSection } from '../components/leaderboard'
import { Card } from '../components/common'

export const LeaderboardPage = () => {
  const { leaderboard, loading, error, refresh } = useLeaderboard()

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
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
        </div>

        {/* Section skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="aspect-[2/3] bg-gray-200 rounded-lg" />
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
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="text-blue-600 hover:text-blue-800 font-medium"
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
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">My Ratings</h1>
        <p className="text-lg text-gray-500">
          What I think about the media I consume.{' '}
          {totalRatings > 0 && (
            <span className="text-gray-700 font-medium">{totalRatings} total ratings.</span>
          )}
        </p>
      </div>

      {isEmpty ? (
        <Card className="text-center py-16 animate-slide-up">
          <div className="text-6xl mb-4">
            <span role="img" aria-label="thinking">
              🤔
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No ratings yet</h2>
          <p className="text-gray-500 max-w-md mx-auto">
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
                icon="🎬"
                reviews={leaderboard.movies}
                emptyMessage="No movie ratings yet"
              />
              <RankedSection
                title="Series"
                icon="📺"
                reviews={leaderboard.series}
                emptyMessage="No series ratings yet"
              />
              <RankedSection
                title="Games"
                icon="🎮"
                reviews={leaderboard.games}
                emptyMessage="No game ratings yet"
              />
              <RankedSection
                title="Books"
                icon="📚"
                reviews={leaderboard.books}
                emptyMessage="No book ratings yet"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
