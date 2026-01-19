import { Link } from 'react-router-dom'
import type { MediaReview } from '../../types/leaderboard'

interface MediaCardProps {
  review: MediaReview
  rank: number
}

export const MediaCard = ({ review, rank }: MediaCardProps) => {
  // Get rating color based on score
  const getRatingColor = (rating: number) => {
    if (rating >= 9) return 'text-green-600 bg-green-50'
    if (rating >= 7) return 'text-blue-600 bg-blue-50'
    if (rating >= 5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // Get rank badge color
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900'
    if (rank === 2) return 'bg-gray-300 text-gray-700'
    if (rank === 3) return 'bg-orange-400 text-orange-900'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Rank Badge */}
      <div
        className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${getRankColor(rank)}`}
      >
        {rank}
      </div>

      {/* Poster */}
      <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
        {review.poster_url ? (
          <img
            src={review.poster_url}
            alt={review.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
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

        {/* Rating Badge */}
        <div
          className={`absolute bottom-2 right-2 px-2 py-1 rounded-full font-bold text-sm ${getRatingColor(review.rating)}`}
        >
          {review.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1" title={review.title}>
          {review.title}
        </h3>
        {review.year && <p className="text-xs text-gray-500 mb-2">{review.year}</p>}

        {/* Links */}
        <div className="flex gap-2 text-xs">
          <Link
            to={`/blog/${review.article_slug}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            My review
          </Link>
          {review.external_url && (
            <>
              <span className="text-gray-300">|</span>
              <a
                href={review.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 hover:underline"
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
