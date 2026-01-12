import { Link } from 'react-router-dom'
import { useArticles } from '../../hooks/useArticles'
import { Card, Button } from '../../components/common'

export const AdminDashboard = () => {
  const { articles, loading } = useArticles(false) // Get all articles including drafts

  const publishedCount = articles.filter((a) => a.published).length
  const draftCount = articles.filter((a) => !a.published).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link to="/admin/articles/new">
          <Button>New Article</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">
              {loading ? '...' : articles.length}
            </p>
            <p className="text-gray-600">Total Articles</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">
              {loading ? '...' : publishedCount}
            </p>
            <p className="text-gray-600">Published</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-600">
              {loading ? '...' : draftCount}
            </p>
            <p className="text-gray-600">Drafts</p>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-2">
          <Link
            to="/admin/articles"
            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Manage Articles</span>
            <p className="text-sm text-gray-500">
              View, edit, and delete articles
            </p>
          </Link>
          <Link
            to="/admin/articles/new"
            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Create New Article</span>
            <p className="text-sm text-gray-500">
              Write a new blog post
            </p>
          </Link>
        </div>
      </Card>
    </div>
  )
}
