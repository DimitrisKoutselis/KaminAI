import { useState, useCallback, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = useCallback(() => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }, [input, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ minHeight: '40px', maxHeight: '120px' }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
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
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
