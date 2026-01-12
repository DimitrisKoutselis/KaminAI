import { Link } from 'react-router-dom'
import type { Article } from '../../types/article'
import { Card } from '../common'

interface ArticleCardProps {
  article: Article
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link to={`/blog/${article.slug}`} className="block h-full">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 text-gray-600 text-sm line-clamp-2">{article.summary}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {new Date(article.created_at).toLocaleDateString()}
          </span>
        </div>
      </Card>
    </Link>
  )
}
