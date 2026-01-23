import { useState } from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { leaderboardService } from '../../services/leaderboardService'
import { Card, Button } from '../../components/common'
import type { MediaReviewCreate } from '../../types/leaderboard'

export const ReviewsAdmin = () => {
  const { leaderboard, loading, error, refresh } = useLeaderboard()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [formData, setFormData] = useState<MediaReviewCreate>({
    title: '',
    media_type: 'movie',
    rating: 8,
    year: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)

    try {
      const dataToSend: MediaReviewCreate = {
        ...formData,
        year: formData.year || undefined,
      }
      await leaderboardService.createReview(dataToSend)
      setFormData({ title: '', media_type: 'movie', rating: 8, year: '' })
      setShowForm(false)
      refresh()
    } catch (err) {
      console.error('Create error:', err)
      setFormError('Failed to create review')
    } finally {
      setSaving(false)
    }
  }

  const totalReviews = leaderboard
    ? leaderboard.movies.length +
      leaderboard.series.length +
      leaderboard.games.length +
      leaderboard.books.length
    : 0

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <Card>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <p className="text-red-500">{error}</p>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">
            Manage media reviews ({totalReviews} total)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Review'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Review
          </h2>
          {formError && (
            <p className="text-red-500 text-sm mb-4">{formError}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Persona 5 Royal"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.media_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      media_type: e.target.value as MediaReviewCreate['media_type'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                  <option value="game">Game</option>
                  <option value="book">Book</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year (optional)
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2020"
                  pattern="\d{4}"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Create Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {leaderboard && (
        <div className="space-y-6">
          <ReviewSection title="Movies" icon="🎬" reviews={leaderboard.movies} />
          <ReviewSection title="Series" icon="📺" reviews={leaderboard.series} />
          <ReviewSection title="Games" icon="🎮" reviews={leaderboard.games} />
          <ReviewSection title="Books" icon="📚" reviews={leaderboard.books} />
        </div>
      )}
    </div>
  )
}

interface ReviewSectionProps {
  title: string
  icon: string
  reviews: Array<{
    id: string
    title: string
    rating: number
    year: string | null
    poster_url: string | null
  }>
}

const ReviewSection = ({ title, icon, reviews }: ReviewSectionProps) => {
  if (reviews.length === 0) return null

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {icon} {title} ({reviews.length})
      </h2>
      <div className="space-y-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            <div className="flex items-center gap-3">
              {review.poster_url ? (
                <img
                  src={review.poster_url}
                  alt={review.title}
                  className="w-10 h-14 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  ?
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{review.title}</p>
                {review.year && (
                  <p className="text-sm text-gray-500">{review.year}</p>
                )}
              </div>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {review.rating}/10
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
