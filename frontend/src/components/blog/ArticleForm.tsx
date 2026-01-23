import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button, Card } from '../common'
import { uploadService } from '../../services/uploadService'
import { textEnhancementService } from '../../services/textEnhancementService'
import { useAuthContext } from '../../context/AuthContext'
import { TextEnhancementToolbar } from './TextEnhancementToolbar'
import { GrammarIssuesPanel } from './GrammarIssuesPanel'
import { RefinerPanel } from './RefinerPanel'
import type { ArticleCreate, ArticleUpdate, Article } from '../../types/article'
import type { GrammarIssue, RefineSuggestion } from '../../types/textEnhancement'

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
  const [featured, setFeatured] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [isReview, setIsReview] = useState(false)
  const [mediaTitle, setMediaTitle] = useState('')
  const [mediaType, setMediaType] = useState<'movie' | 'series' | 'game' | 'book'>('movie')
  const [rating, setRating] = useState<number | ''>('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Text enhancement state
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([])
  const [refineSuggestions, setRefineSuggestions] = useState<RefineSuggestion[]>([])
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [refineSummary, setRefineSummary] = useState<string | null>(null)
  const [showGrammarPanel, setShowGrammarPanel] = useState(false)
  const [showRefinerPanel, setShowRefinerPanel] = useState(false)

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setContent(article.content)
      setSummary(article.summary)
      setTags(article.tags.join(', '))
      setAuthor(article.author)
      setFeatured(article.featured || false)
      setImageUrl(article.image_url || '')
    } else if (user) {
      setAuthor(user.display_name || user.username)
    }
  }, [article, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalContent = content
    if (isReview && mediaTitle && rating) {
      const ratingSection = `\n\n---\n\n**Media Review**\n- Title: ${mediaTitle}\n- Type: ${mediaType}\n- Rating: ${rating}/10`
      finalContent = content + ratingSection
    }

    const data: ArticleCreate | ArticleUpdate = {
      title,
      content: finalContent,
      summary,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      image_url: imageUrl || undefined,
      featured,
      ...(!article && { author: author || 'Anonymous' }),
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

      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = content.substring(0, start)
        const after = content.substring(end)
        const newContent = `${before}\n${result.markdown}\n${after}`
        setContent(newContent)

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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverUploading(true)
    setUploadError(null)

    try {
      const result = await uploadService.uploadImage(file)
      setImageUrl(result.url)
    } catch (err) {
      console.error('Cover upload error:', err)
      setUploadError('Failed to upload cover image. Please try again.')
    } finally {
      setCoverUploading(false)
      if (coverInputRef.current) {
        coverInputRef.current.value = ''
      }
    }
  }

  const triggerCoverUpload = () => {
    coverInputRef.current?.click()
  }

  // Text enhancement handlers
  const handleCheckGrammar = async () => {
    if (!content.trim()) return

    setIsCheckingGrammar(true)
    setGrammarIssues([])

    try {
      const response = await textEnhancementService.checkGrammar(content, 'content')
      setGrammarIssues(response.issues)
      setShowGrammarPanel(true)
    } catch (error) {
      console.error('Grammar check error:', error)
    } finally {
      setIsCheckingGrammar(false)
    }
  }

  const handleRefineArticle = async () => {
    if (!title.trim() || !summary.trim() || !content.trim()) return

    setIsRefining(true)
    setRefineSuggestions([])
    setOverallScore(null)
    setRefineSummary(null)
    setShowRefinerPanel(true)

    try {
      const response = await textEnhancementService.collectRefineSuggestions(
        {
          title,
          summary,
          content,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
        (chunk) => {
          if (chunk.type === 'suggestion' && chunk.data) {
            setRefineSuggestions((prev) => [...prev, chunk.data as RefineSuggestion])
          } else if (chunk.type === 'score' && typeof chunk.data === 'number') {
            setOverallScore(chunk.data)
          } else if (chunk.type === 'summary' && typeof chunk.data === 'string') {
            setRefineSummary(chunk.data)
          }
        }
      )

      // Final update with complete response
      setRefineSuggestions(response.suggestions)
      setOverallScore(response.overall_score)
      setRefineSummary(response.summary)
    } catch (error) {
      console.error('Refine article error:', error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleApplyGrammarSuggestion = (issue: GrammarIssue, suggestion: string) => {
    const newContent =
      content.substring(0, issue.position) +
      suggestion +
      content.substring(issue.position + issue.length)
    setContent(newContent)

    // Remove the applied issue and adjust positions for remaining issues
    setGrammarIssues((prev) => {
      const lengthDiff = suggestion.length - issue.length
      return prev
        .filter((i) => i !== issue)
        .map((i) => {
          if (i.position > issue.position) {
            return { ...i, position: i.position + lengthDiff }
          }
          return i
        })
    })
  }

  const handleDismissGrammarIssue = (index: number) => {
    setGrammarIssues((prev) => prev.filter((_, i) => i !== index))
  }

  const handleApplyRefineSuggestion = (suggestion: RefineSuggestion) => {
    // Find and replace the original text with the suggested text
    switch (suggestion.field) {
      case 'title':
        if (title.includes(suggestion.original)) {
          setTitle(title.replace(suggestion.original, suggestion.suggested))
        } else {
          setTitle(suggestion.suggested)
        }
        break
      case 'summary':
        if (summary.includes(suggestion.original)) {
          setSummary(summary.replace(suggestion.original, suggestion.suggested))
        } else {
          setSummary(suggestion.suggested)
        }
        break
      case 'content':
        if (content.includes(suggestion.original)) {
          setContent(content.replace(suggestion.original, suggestion.suggested))
        }
        break
    }

    // Remove the applied suggestion
    setRefineSuggestions((prev) => prev.filter((s) => s !== suggestion))
  }

  const handleDismissRefineSuggestion = (index: number) => {
    setRefineSuggestions((prev) => prev.filter((_, i) => i !== index))
  }

  const canRefine = title.trim() && summary.trim() && content.trim()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              spellCheck={true}
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
              spellCheck={true}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of the article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image (optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              This image will be displayed on the article card. If you add a media review, it can be auto-populated from external databases.
            </p>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or upload an image"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerCoverUpload}
                    disabled={coverUploading}
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    {coverUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Cover preview"
                  className="w-24 h-32 object-cover rounded-lg shadow-sm"
                />
              )}
            </div>
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
            <TextEnhancementToolbar
              onCheckGrammar={handleCheckGrammar}
              onRefineArticle={handleRefineArticle}
              isCheckingGrammar={isCheckingGrammar}
              isRefining={isRefining}
              grammarIssuesCount={grammarIssues.length}
              canRefine={!!canRefine}
            />
            <textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              spellCheck={true}
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

          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  <span className="mr-2">⭐</span>
                  Feature this article on the homepage
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-7">
                Featured articles appear prominently at the top of the homepage.
              </p>
            </div>

          {article && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isReview"
                checked={isReview}
                onChange={(e) => setIsReview(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isReview" className="text-sm font-medium text-gray-700">
                This article contains a media review (movie, series, game, or book)
              </label>
            </div>

            {isReview && (
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media Title
                  </label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., Persona 5 Royal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as typeof mediaType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                    <option value="game">Game</option>
                    <option value="book">Book</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="8"
                  />
                </div>
              </div>
            )}
          </div>
          )}

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

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </div>

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

      {/* Text Enhancement Panels */}
      <GrammarIssuesPanel
        isOpen={showGrammarPanel}
        onClose={() => setShowGrammarPanel(false)}
        issues={grammarIssues}
        onApplySuggestion={handleApplyGrammarSuggestion}
        onDismissIssue={handleDismissGrammarIssue}
      />

      <RefinerPanel
        isOpen={showRefinerPanel}
        onClose={() => setShowRefinerPanel(false)}
        suggestions={refineSuggestions}
        overallScore={overallScore}
        summary={refineSummary}
        isLoading={isRefining}
        onApplySuggestion={handleApplyRefineSuggestion}
        onDismissSuggestion={handleDismissRefineSuggestion}
      />
    </form>
  )
}
