import { useArticles } from '../hooks/useArticles'
import { ArticleList } from '../components/blog'
import { Card } from '../components/common'

export const BlogPage = () => {
  const { articles, loading, error } = useArticles()

  return (
    <div>
      <Card className="mb-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Blog</h1>
        <p className="text-gray-600 dark:text-zinc-400">
          Thoughts, tutorials, and insights on software development.
        </p>
      </Card>

      <ArticleList articles={articles} loading={loading} error={error} />
    </div>
  )
}
