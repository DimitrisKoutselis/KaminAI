import { Link } from 'react-router-dom'
import type { Article } from '../../types/article'

interface ArticleCardProps {
  article: Article
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link to={`/blog/${article.slug}`} className="group block">
      <article className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-zinc-300 dark:text-zinc-600"
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
              <span className="px-2.5 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-full shadow-sm">
                {article.tags[0]}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 mb-4 flex-grow">
            {article.summary}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                <span className="text-white dark:text-zinc-900 text-xs font-medium">
                  {article.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{article.author}</span>
            </div>
            <time className="text-xs text-zinc-400 dark:text-zinc-500">
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
                  className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 4 && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">+{article.tags.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
