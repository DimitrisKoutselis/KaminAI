import { useParams } from 'react-router-dom'
import { useArticle } from '../hooks/useArticles'
import { ArticleDetail } from '../components/blog'
import { Card } from '../components/common'

export const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const { article, loading, error } = useArticle(slug || '')

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <Card className="max-w-xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Article Not Found
        </h2>
        <p className="text-gray-600">
          {error || "The article you're looking for doesn't exist."}
        </p>
      </Card>
    )
  }

  return <ArticleDetail article={article} />
}
