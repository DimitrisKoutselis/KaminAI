import { useState } from 'react'
import type { RefineSuggestion, SuggestionCategory } from '../../types/textEnhancement'

interface RefinerPanelProps {
  isOpen: boolean
  onClose: () => void
  suggestions: RefineSuggestion[]
  overallScore: number | null
  summary: string | null
  isLoading: boolean
  onApplySuggestion: (suggestion: RefineSuggestion) => void
  onDismissSuggestion: (index: number) => void
}

const categoryConfig: Record<
  SuggestionCategory,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  style: {
    label: 'Style',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: '✨',
  },
  structure: {
    label: 'Structure',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: '📐',
  },
  clarity: {
    label: 'Clarity',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: '💡',
  },
  tone: {
    label: 'Tone',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: '🎭',
  },
  engagement: {
    label: 'Engagement',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200',
    icon: '🎯',
  },
}

const ScoreRing = ({ score }: { score: number }) => {
  const percentage = (score / 10) * 100
  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const color =
    score >= 7 ? 'text-green-500' : score >= 5 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-500`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold ${color}`}>{score.toFixed(1)}</span>
      </div>
    </div>
  )
}

export const RefinerPanel = ({
  isOpen,
  onClose,
  suggestions,
  overallScore,
  summary,
  isLoading,
  onApplySuggestion,
  onDismissSuggestion,
}: RefinerPanelProps) => {
  const [activeFilter, setActiveFilter] = useState<SuggestionCategory | 'all'>('all')

  if (!isOpen) return null

  const filteredSuggestions =
    activeFilter === 'all'
      ? suggestions
      : suggestions.filter((s) => s.category === activeFilter)

  const categoryCounts = suggestions.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[450px] max-w-full bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">
              Article Refiner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Analyzing your article...
              </h3>
              <p className="text-sm text-gray-500">
                Our AI is reviewing style, structure, clarity, tone, and engagement.
              </p>
            </div>
          ) : suggestions.length === 0 && !summary ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Ready to refine
              </h3>
              <p className="text-sm text-gray-500">
                Click &quot;Refine Article&quot; to get AI-powered suggestions for improving your writing.
              </p>
            </div>
          ) : (
            <>
              {/* Score and Summary */}
              {(overallScore !== null || summary) && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-4">
                    {overallScore !== null && (
                      <div className="flex-shrink-0">
                        <ScoreRing score={overallScore} />
                        <p className="text-xs text-center text-gray-500 mt-1">
                          Quality Score
                        </p>
                      </div>
                    )}
                    {summary && (
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Summary
                        </h4>
                        <p className="text-sm text-gray-600">{summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category Filters */}
              {suggestions.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                        activeFilter === 'all'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All ({suggestions.length})
                    </button>
                    {(Object.keys(categoryConfig) as SuggestionCategory[]).map(
                      (category) =>
                        categoryCounts[category] > 0 && (
                          <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                              activeFilter === category
                                ? `${categoryConfig[category].bgColor} ${categoryConfig[category].color} border`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {categoryConfig[category].icon}{' '}
                            {categoryConfig[category].label} ({categoryCounts[category]})
                          </button>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions List */}
              <div className="p-4 space-y-3">
                {filteredSuggestions.map((suggestion, index) => {
                  const config = categoryConfig[suggestion.category]
                  const originalIndex = suggestions.indexOf(suggestion)
                  return (
                    <div
                      key={`${suggestion.field}-${index}`}
                      className={`border rounded-lg p-3 ${config.bgColor}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{config.icon}</span>
                          <span
                            className={`text-xs font-medium ${config.color} uppercase tracking-wide`}
                          >
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            • {suggestion.field}
                          </span>
                        </div>
                        <button
                          onClick={() => onDismissSuggestion(originalIndex)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          title="Dismiss"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">
                            Original:
                          </p>
                          <p className="text-gray-700 bg-white/50 p-2 rounded border border-gray-200/50">
                            {suggestion.original}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">
                            Suggested:
                          </p>
                          <p className="text-gray-900 bg-white p-2 rounded border border-green-200">
                            {suggestion.suggested}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 italic">
                          {suggestion.explanation}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200/50 flex justify-end">
                        <button
                          onClick={() => onApplySuggestion(suggestion)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                          Apply Suggestion
                        </button>
                      </div>
                    </div>
                  )
                })}

                {filteredSuggestions.length === 0 && suggestions.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No suggestions in this category</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
