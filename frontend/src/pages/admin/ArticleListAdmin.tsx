import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useArticles } from '../../hooks/useArticles'
import { articleService } from '../../services/articleService'
import { Card, Button } from '../../components/common'

const LOADING_MESSAGES = {
  games: [
    'Rolling for initiative...',
    'Loading save file...',
    'Checking inventory...',
    'Equipping best gear...',
    'Grinding XP...',
    'Defeating the tutorial boss...',
    'Fast traveling to destination...',
    'Consulting the strategy guide...',
    'Mashing buttons frantically...',
    'Speedrunning the extraction...',
  ],
  movies: [
    'Rolling the credits...',
    'Adjusting the aspect ratio...',
    'Popping the popcorn...',
    'Finding the best seat...',
    'Waiting for post-credits scene...',
    'Dimming the lights...',
    'Silencing phones...',
    'Checking Rotten Tomatoes...',
    'Analyzing plot twists...',
    'Debating director\'s cut vs theatrical...',
  ],
  series: [
    'Binge-watching in progress...',
    'Skipping the intro...',
    'Loading next episode...',
    'Avoiding spoilers...',
    'Checking episode runtime...',
    'Making predictions...',
    'Refreshing for new season...',
    'Joining fan theories...',
    'Judging the finale...',
    'Adding to watchlist...',
  ],
  books: [
    'Turning the pages...',
    'Finding the bookmark...',
    'Consulting the glossary...',
    'Reading between the lines...',
    'Analyzing the subtext...',
    'Checking chapter count...',
    'Appreciating the prose...',
    'Avoiding dog-ears...',
    'Smelling the new book smell...',
    'Judging by the cover anyway...',
  ],
  general: [
    'Summoning the AI...',
    'Extracting opinions...',
    'Calibrating taste meters...',
    'Consulting the critics...',
    'Analyzing your hot takes...',
    'Processing masterpiece status...',
    'Validating controversial opinions...',
    'Computing enjoyment levels...',
    'Measuring emotional damage...',
    'Publishing your wisdom...',
  ],
}

const getRandomMessage = (category: string = 'general'): string => {
  const messages = LOADING_MESSAGES[category as keyof typeof LOADING_MESSAGES] || LOADING_MESSAGES.general
  return messages[Math.floor(Math.random() * messages.length)]
}

export const ArticleListAdmin = () => {
  const { articles, loading, error, refetch } = useArticles(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState<string>('')

  useEffect(() => {
    if (!publishing) return

    setLoadingMessage(getRandomMessage())

    const interval = setInterval(() => {
      setLoadingMessage(getRandomMessage())
    }, 2000)

    return () => clearInterval(interval)
  }, [publishing])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return
    }

    setDeleting(id)
    try {
      await articleService.deleteArticle(id)
      refetch()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete article')
    } finally {
      setDeleting(null)
    }
  }

  const handleTogglePublish = async (id: string, published: boolean) => {
    if (!published) {
      setPublishing(id)
    }
    try {
      if (published) {
        await articleService.unpublishArticle(id)
      } else {
        await articleService.publishArticle(id)
      }
      refetch()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update article')
    } finally {
      setPublishing(null)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </Card>
        ))}
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
      {publishing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4 text-center">
            <div className="py-8 px-6">
              <div className="mb-6">
                <svg
                  className="animate-spin h-12 w-12 mx-auto text-blue-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Publishing Article
              </h3>
              <p className="text-gray-600 mb-4">
                AI is analyzing your article for media reviews...
              </p>
              <p className="text-blue-600 font-medium animate-pulse min-h-[1.5rem]">
                {loadingMessage}
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600">Manage your blog articles</p>
        </div>
        <Link to="/admin/articles/new">
          <Button>New Article</Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-500 mb-4">No articles yet.</p>
          <Link to="/admin/articles/new">
            <Button>Create your first article</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">
                      {article.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        article.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(article.created_at).toLocaleDateString()} &bull;{' '}
                    {article.tags.join(', ')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleTogglePublish(article.id, article.published)
                    }
                    disabled={publishing === article.id}
                    className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {publishing === article.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Publishing...
                      </span>
                    ) : article.published ? (
                      'Unpublish'
                    ) : (
                      'Publish'
                    )}
                  </button>
                  <Link
                    to={`/admin/articles/${article.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deleting === article.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
