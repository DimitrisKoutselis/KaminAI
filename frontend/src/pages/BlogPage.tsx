import { useArticles } from '../hooks/useArticles'
import { ArticleList } from '../components/blog'
import { Card } from '../components/common'

export const BlogPage = () => {
  const { articles, loading, error } = useArticles()

  return (
    <div>
      <Card className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-600">
          Thoughts, tutorials, and insights on software development.
        </p>
      </Card>

      <ArticleList articles={articles} loading={loading} error={error} />
    </div>
  )
}
