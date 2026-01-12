import { useState, useCallback, useRef } from 'react'
import { chatService } from '../services/chatService'
import type { ChatMessage } from '../types/chat'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
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
  }, [isLoading, messages])

  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}
