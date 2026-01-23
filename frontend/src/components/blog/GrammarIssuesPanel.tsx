import type { GrammarIssue, IssueSeverity } from '../../types/textEnhancement'

interface GrammarIssuesPanelProps {
  isOpen: boolean
  onClose: () => void
  issues: GrammarIssue[]
  onApplySuggestion: (issue: GrammarIssue, suggestion: string) => void
  onDismissIssue: (index: number) => void
}

const severityConfig: Record<
  IssueSeverity,
  { color: string; bgColor: string; icon: string }
> = {
  error: {
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: '!',
  },
  warning: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: '⚠',
  },
  info: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: 'i',
  },
}

export const GrammarIssuesPanel = ({
  isOpen,
  onClose,
  issues,
  onApplySuggestion,
  onDismissIssue,
}: GrammarIssuesPanelProps) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 max-w-full bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">
              Grammar Check
            </h2>
            {issues.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
              </span>
            )}
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
        <div className="flex-1 overflow-y-auto p-4">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No issues found
              </h3>
              <p className="text-sm text-gray-500">
                Your text looks good! No grammar or spelling issues detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, index) => {
                const config = severityConfig[issue.severity]
                return (
                  <div
                    key={`${issue.position}-${index}`}
                    className={`border rounded-lg p-3 ${config.bgColor}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${config.color} bg-white`}
                        >
                          {config.icon}
                        </span>
                        <div>
                          <p className={`text-sm font-medium ${config.color}`}>
                            {issue.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Found: <code className="bg-white/50 px-1 rounded">&quot;{issue.original_text}&quot;</code>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDismissIssue(index)}
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

                    {issue.suggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200/50">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">
                          Suggestions:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {issue.suggestions.map((suggestion, sIndex) => (
                            <button
                              key={sIndex}
                              onClick={() => onApplySuggestion(issue, suggestion)}
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
