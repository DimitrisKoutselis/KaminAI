import { Link } from 'react-router-dom'
import type { Article } from '../../types/article'

interface ArticleCardProps {
  article: Article
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link to={`/blog/${article.slug}`} className="group block">
      <article className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
          {article.tags.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                {article.tags[0]}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>

          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
            {article.summary}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {article.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 font-medium">{article.author}</span>
            </div>
            <time className="text-xs text-gray-400">
              {new Date(article.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>

          {article.tags.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {article.tags.slice(1, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 4 && (
                <span className="text-xs text-gray-400">+{article.tags.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
