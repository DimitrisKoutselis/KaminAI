import { Link } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import { ArticleCard } from '../components/blog'
import { Button, Card } from '../components/common'

export const HomePage = () => {
  const { articles, loading } = useArticles()
  const recentArticles = articles.slice(0, 3)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative text-center">
          <p className="text-blue-600 font-medium mb-4 animate-fade-in">
            Welcome to my corner of the internet
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
            Hey, I&apos;m{' '}
            <span className="gradient-text">Dimitris</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up-delay-1">
            AI Engineer crafting intelligent systems with LangGraph, RAG, and a whole lot of curiosity.
            I write about what I learn and build things that excite me.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up-delay-2">
            <Link to="/blog">
              <Button size="lg" className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
                Read My Blog
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
                View Portfolio
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
                About Me
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center">
        <div className="h-px w-16 bg-gray-300" />
        <div className="mx-4 w-2 h-2 rounded-full bg-blue-500" />
        <div className="h-px w-16 bg-gray-300" />
      </div>

      {/* Recent Articles */}
      <section className="animate-slide-up-delay-3">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recent Articles</h2>
            <p className="text-gray-500 mt-1">Thoughts, learnings, and experiments</p>
          </div>
          <Link
            to="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
          >
            View all
            <span className="transform group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
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
              <div
                key={article.id}
                className="transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200"
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-500 mb-4">No articles yet. Stay tuned!</p>
            <p className="text-sm text-gray-400">I&apos;m working on some exciting content.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
