import type { MediaReview } from '../../types/leaderboard'
import { MediaCard } from './MediaCard'
import { Card } from '../common'

interface RankedSectionProps {
  title: string
  icon: string
  reviews: MediaReview[]
}

export const RankedSection = ({ title, icon, reviews }: RankedSectionProps) => {
  if (reviews.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <Card className="flex items-center gap-3 mb-6" padding="sm">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}
        </span>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {reviews.map((review, index) => (
          <MediaCard key={review.id} review={review} rank={index + 1} />
        ))}
      </div>
    </section>
  )
}
