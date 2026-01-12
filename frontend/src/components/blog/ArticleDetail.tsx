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
        className="text-blue-600 hover:text-blue-700 text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <article
        className="overflow-hidden mt-6"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        }}
      >
        <header
          className="px-8 pt-8 pb-6"
          style={{
            borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(to right, #f9fafb, #ffffff)',
          }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">{article.author}</span>
              <span>&bull;</span>
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            {article.updated_at !== article.created_at && (
              <span className="text-gray-400">
                Updated {new Date(article.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  )
}
