import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articleService } from '../../services/articleService'
import { ArticleForm } from '../../components/blog/ArticleForm'
import { Card } from '../../components/common'
import type { Article, ArticleCreate, ArticleUpdate } from '../../types/article'

export const ArticleEditor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew && id) {
      const fetchArticle = async () => {
        try {
          const data = await articleService.getArticle(id)
          setArticle(data)
        } catch (err) {
          console.error('Fetch error:', err)
          setError('Failed to load article')
        } finally {
          setLoading(false)
        }
      }
      fetchArticle()
    }
  }, [id, isNew])

  const handleSubmit = async (data: ArticleCreate | ArticleUpdate) => {
    setSaving(true)
    setError(null)

    try {
      if (isNew) {
        await articleService.createArticle(data as ArticleCreate)
      } else if (id) {
        await articleService.updateArticle(id, data as ArticleUpdate)
      }
      navigate('/admin/articles')
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <Card>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-60 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    )
  }

  if (error && !isNew && !article) {
    return (
      <Card>
        <p className="text-red-500">{error}</p>
      </Card>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isNew ? 'New Article' : 'Edit Article'}
      </h1>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <Card>
        <ArticleForm
          article={article || undefined}
          onSubmit={handleSubmit}
          isLoading={saving}
        />
      </Card>
    </div>
  )
}
