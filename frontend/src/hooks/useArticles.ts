import { useState, useEffect, useCallback } from 'react'
import { articleService } from '../services/articleService'
import type { Article } from '../types/article'

export const useArticles = (publishedOnly = true) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await articleService.getArticles(publishedOnly)
      setArticles(response.articles)
    } catch (err) {
      setError('Failed to load articles')
      console.error('Fetch articles error:', err)
    } finally {
      setLoading(false)
    }
  }, [publishedOnly])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return { articles, loading, error, refetch: fetchArticles }
}

export const useArticle = (slug: string) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)
        const data = await articleService.getArticleBySlug(slug)
        setArticle(data)
      } catch (err) {
        setError('Failed to load article')
        console.error('Fetch article error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  return { article, loading, error }
}
