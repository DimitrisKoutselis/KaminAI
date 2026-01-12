import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button, Card } from '../common'
import { uploadService } from '../../services/uploadService'
import { useAuthContext } from '../../context/AuthContext'
import type { ArticleCreate, ArticleUpdate, Article } from '../../types/article'

interface ArticleFormProps {
  article?: Article
  onSubmit: (data: ArticleCreate | ArticleUpdate) => Promise<void>
  isLoading?: boolean
}

export const ArticleForm = ({
  article,
  onSubmit,
  isLoading,
}: ArticleFormProps) => {
  const { user } = useAuthContext()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState('')
  const [author, setAuthor] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setContent(article.content)
      setSummary(article.summary)
      setTags(article.tags.join(', '))
      setAuthor(article.author)
    } else if (user) {
      // Auto-populate author from user profile
      setAuthor(user.display_name || user.username)
    }
  }, [article, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: ArticleCreate | ArticleUpdate = {
      title,
      content,
      summary,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      ...(article ? {} : { author: author || 'Anonymous' }),
    }

    await onSubmit(data)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const result = await uploadService.uploadImage(file)

      // Insert markdown at cursor position or at end
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.substring(0, start)
        const after = content.substring(end)
        const newContent = `${before}\n${result.markdown}\n${after}`
        setContent(newContent)

        // Reset cursor position after the inserted markdown
        setTimeout(() => {
          const newPosition = start + result.markdown.length + 2
          textarea.selectionStart = newPosition
          textarea.selectionEnd = newPosition
          textarea.focus()
        }, 0)
      } else {
        setContent((prev) => `${prev}\n${result.markdown}\n`)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Editor */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Summary
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of the article"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content (Markdown)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={triggerFileUpload}
                  disabled={uploading}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {uploading ? 'Uploading...' : 'Add Image'}
                </button>
              </div>
            </div>
            {uploadError && (
              <p className="text-sm text-red-500 mb-2">{uploadError}</p>
            )}
            <textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your article in Markdown..."
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., python, fastapi, tutorial"
            />
          </div>

          {!article && (
            <div>
              <label
                htmlFor="author"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Author
              </label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </div>

        {/* Right side - Live Preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">Live Preview</span>
          </div>
          <Card className="min-h-[600px] max-h-[80vh] overflow-y-auto">
            <article className="prose max-w-none">
              {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
              {summary && (
                <p className="text-gray-600 italic border-l-4 border-blue-500 pl-4 mb-4">
                  {summary}
                </p>
              )}
              {tags && (
                <div className="flex flex-wrap gap-2 mb-4 not-prose">
                  {tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <hr className="my-4" />
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => (
                    <img {...props} className="max-w-full h-auto rounded-lg" />
                  ),
                }}
              >
                {content || '*Start writing to see the preview...*'}
              </ReactMarkdown>
            </article>
          </Card>
        </div>
      </div>
    </form>
  )
}
