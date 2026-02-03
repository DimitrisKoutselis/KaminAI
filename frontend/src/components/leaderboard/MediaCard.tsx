import { Link } from 'react-router-dom'
import type { MediaReview } from '../../types/leaderboard'

interface MediaCardProps {
  review: MediaReview
  rank: number
}

export const MediaCard = ({ review, rank }: MediaCardProps) => {
  const getRatingColor = () => {
    return 'text-zinc-900 bg-zinc-100'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-zinc-900 text-white'
    if (rank === 2) return 'bg-zinc-600 text-white'
    if (rank === 3) return 'bg-zinc-400 text-white'
    return 'bg-zinc-200 text-zinc-700'
  }

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <div
        className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${getRankColor(rank)}`}
      >
        {rank}
      </div>

      <div className="aspect-[2/3] bg-zinc-100 relative overflow-hidden">
        {review.poster_url ? (
          <img
            src={review.poster_url}
            alt={review.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <div
          className={`absolute bottom-2 right-2 px-2 py-1 rounded-full font-bold text-sm ${getRatingColor()}`}
        >
          {review.rating.toFixed(1)}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-zinc-900 text-sm line-clamp-2 mb-1" title={review.title}>
          {review.title}
        </h3>
        {review.year && <p className="text-xs text-zinc-500 mb-2">{review.year}</p>}

        <div className="flex gap-2 text-xs">
          <Link
            to={`/blog/${review.article_slug}`}
            className="text-zinc-900 hover:text-zinc-600 hover:underline font-medium"
          >
            My review
          </Link>
          {review.external_url && (
            <>
              <span className="text-zinc-300">|</span>
              <a
                href={review.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-700 hover:underline"
              >
                Details
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
