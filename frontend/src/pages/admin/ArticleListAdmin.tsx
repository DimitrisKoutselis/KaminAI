import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useArticles } from '../../hooks/useArticles'
import { articleService } from '../../services/articleService'
import { Card, Button } from '../../components/common'

export const ArticleListAdmin = () => {
  const { articles, loading, error, refetch } = useArticles(false)
  const [deleting, setDeleting] = useState<string | null>(null)

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
    try {
      await articleService.updateArticle(id, { published: !published })
      refetch()
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update article')
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
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {article.published ? 'Unpublish' : 'Publish'}
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
