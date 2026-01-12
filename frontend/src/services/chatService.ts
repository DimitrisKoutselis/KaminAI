import api from './api'
import type { ChatMessage, ChatResponse, IndexStats, StreamChunk } from '../types/chat'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const chatService = {
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    const response = await api.post<ChatResponse>('/chat/', {
      message,
      conversation_history: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    })
    return response.data.response
  },

  async *sendMessageStream(
    message: string,
    conversationHistory: ChatMessage[]
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No reader available')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data: StreamChunk = JSON.parse(line.slice(6))

            if (data.error) {
              throw new Error(data.error)
            }

            if (data.done) {
              return
            }

            if (data.content) {
              yield data.content
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              continue
            }
            throw e
          }
        }
      }
    }
  },

  async getIndexStats(): Promise<IndexStats> {
    const response = await api.get<IndexStats>('/chat/index/stats')
    return response.data
  },
}
