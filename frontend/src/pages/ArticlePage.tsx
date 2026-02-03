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
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-24 mb-8" />
        <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <Card className="max-w-xl mx-auto text-center dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Article Not Found
        </h2>
        <p className="text-gray-600 dark:text-zinc-400">
          {error || "The article you're looking for doesn't exist."}
        </p>
      </Card>
    )
  }

  return <ArticleDetail article={article} />
}
