import api from './api'
import { authService } from './authService'
import type {
  GrammarCheckRequest,
  GrammarCheckResponse,
  RefineRequest,
  RefineResponse,
  RefineStreamChunk,
  RefineSuggestion,
} from '../types/textEnhancement'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const textEnhancementService = {
  /**
   * Check text for grammar issues
   */
  async checkGrammar(
    text: string,
    fieldName?: string
  ): Promise<GrammarCheckResponse> {
    const request: GrammarCheckRequest = {
      text,
      field_name: fieldName,
    }
    const response = await api.post<GrammarCheckResponse>(
      '/text-enhancement/grammar-check',
      request
    )
    return response.data
  },

  /**
   * Refine an article (non-streaming)
   */
  async refineArticle(request: RefineRequest): Promise<RefineResponse> {
    const response = await api.post<RefineResponse>(
      '/text-enhancement/refine',
      request
    )
    return response.data
  },

  /**
   * Stream article refinement suggestions
   * Yields parsed chunks as they arrive
   */
  async *refineArticleStream(
    request: RefineRequest
  ): AsyncGenerator<RefineStreamChunk, void, unknown> {
    const token = authService.getToken()

    const response = await fetch(`${API_URL}/text-enhancement/refine/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
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
            const chunk: RefineStreamChunk = JSON.parse(line.slice(6))
            yield chunk
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

  /**
   * Helper to collect all suggestions from a stream
   */
  async collectRefineSuggestions(
    request: RefineRequest,
    onProgress?: (chunk: RefineStreamChunk) => void
  ): Promise<RefineResponse> {
    const suggestions: RefineSuggestion[] = []
    let overallScore = 5.0
    let summary = ''

    for await (const chunk of this.refineArticleStream(request)) {
      onProgress?.(chunk)

      switch (chunk.type) {
        case 'suggestion':
          if (chunk.data && typeof chunk.data === 'object') {
            suggestions.push(chunk.data as RefineSuggestion)
          }
          break
        case 'score':
          if (typeof chunk.data === 'number') {
            overallScore = chunk.data
          }
          break
        case 'summary':
          if (typeof chunk.data === 'string') {
            summary = chunk.data
          }
          break
        case 'error':
          throw new Error(chunk.data as string)
      }
    }

    return {
      suggestions,
      overall_score: overallScore,
      summary,
    }
  },
}
