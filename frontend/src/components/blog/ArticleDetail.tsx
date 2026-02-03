import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import type { Article } from '../../types/article'

interface ArticleDetailProps {
  article: Article
}

export const ArticleDetail = ({ article }: ArticleDetailProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/blog"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <article className="overflow-hidden mt-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-800">
        <header className="px-8 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700 dark:text-zinc-300">{article.author}</span>
              <span>&bull;</span>
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            {article.updated_at !== article.created_at && (
              <span className="text-gray-400 dark:text-zinc-500">
                Updated {new Date(article.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  )
}
