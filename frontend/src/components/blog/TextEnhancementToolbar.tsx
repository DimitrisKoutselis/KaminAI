interface TextEnhancementToolbarProps {
  onCheckGrammar: () => void
  onRefineArticle: () => void
  isCheckingGrammar: boolean
  isRefining: boolean
  grammarIssuesCount: number
  canRefine: boolean
}

export const TextEnhancementToolbar = ({
  onCheckGrammar,
  onRefineArticle,
  isCheckingGrammar,
  isRefining,
  grammarIssuesCount,
  canRefine,
}: TextEnhancementToolbarProps) => {
  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        AI Tools
      </span>
      <div className="w-px h-4 bg-gray-300" />

      <button
        type="button"
        onClick={onCheckGrammar}
        disabled={isCheckingGrammar || isRefining}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isCheckingGrammar ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Checking...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4 text-gray-500"
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
            Check Grammar
            {grammarIssuesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                {grammarIssuesCount}
              </span>
            )}
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onRefineArticle}
        disabled={isRefining || isCheckingGrammar || !canRefine}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRefining ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Analyzing...
          </>
        ) : (
          <>
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Refine Article
          </>
        )}
      </button>

      {!canRefine && (
        <span className="text-xs text-gray-400">
          Fill title, summary & content to refine
        </span>
      )}
    </div>
  )
}
