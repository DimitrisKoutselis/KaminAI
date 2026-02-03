import { useState, useCallback, useRef, useEffect } from 'react'
import { chatService } from '../services/chatService'
import { authService } from '../services/authService'
import { useAuthContext } from '../context/AuthContext'
import type { ChatMessage } from '../types/chat'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [isUnlimited, setIsUnlimited] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { isAuthenticated } = useAuthContext()

  // Fetch message limit on mount and when auth changes
  useEffect(() => {
    const fetchMessageLimit = async () => {
      if (!isAuthenticated) {
        setRemainingMessages(null)
        setIsUnlimited(false)
        return
      }

      try {
        const limit = await authService.getMessageLimit()
        setRemainingMessages(limit.remaining_messages)
        setIsUnlimited(limit.is_unlimited)
      } catch (err) {
        console.error('Failed to fetch message limit:', err)
      }
    }

    fetchMessageLimit()
  }, [isAuthenticated])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Check if user can send message
    if (!isUnlimited && remainingMessages !== null && remainingMessages <= 0) {
      setError('Message limit reached. Maximum 5 messages allowed.')
      return
    }

    setError(null)
    setIsLoading(true)

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const conversationHistory = [...messages, userMessage]

      let fullResponse = ''

      for await (const chunk of chatService.sendMessageStream(
        content.trim(),
        conversationHistory
      )) {
        fullResponse += chunk
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastIndex = newMessages.length - 1
          if (newMessages[lastIndex]?.role === 'assistant') {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: fullResponse,
            }
          }
          return newMessages
        })
      }

      // Decrement remaining messages count after successful send
      if (!isUnlimited && remainingMessages !== null) {
        setRemainingMessages(remainingMessages - 1)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)

      // Check if it's a limit reached error
      if (errorMessage.includes('limit reached')) {
        setRemainingMessages(0)
      }

      setMessages((prev) => {
        const newMessages = [...prev]
        const lastIndex = newMessages.length - 1
        if (
          newMessages[lastIndex]?.role === 'assistant' &&
          !newMessages[lastIndex].content
        ) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: `Sorry, I encountered an error: ${errorMessage}`,
          }
        }
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, remainingMessages, isUnlimited])

  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([])
    setError(null)
    setIsLoading(false)
  }, [])

  const limitReached = !isUnlimited && remainingMessages !== null && remainingMessages <= 0

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    remainingMessages,
    isUnlimited,
    limitReached,
  }
}
