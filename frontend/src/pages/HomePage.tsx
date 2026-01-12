import { Link } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import { ArticleCard } from '../components/blog'
import { Button, Card } from '../components/common'

export const HomePage = () => {
  const { articles, loading } = useArticles()
  const recentArticles = articles.slice(0, 3)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to My Digital Space
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          I&apos;m a developer passionate about building great software. Explore
          my blog and check out my portfolio.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/blog">
            <Button size="lg">Read My Blog</Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="secondary" size="lg">
              View Portfolio
            </Button>
          </Link>
        </div>
      </section>

      {/* Recent Articles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            View all &rarr;
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500">No articles yet.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
