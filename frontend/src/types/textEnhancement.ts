/**
 * Type definitions for text enhancement features
 */

export type IssueSeverity = 'error' | 'warning' | 'info'

export type SuggestionCategory = 'style' | 'structure' | 'clarity' | 'tone' | 'engagement'

export interface GrammarIssue {
  position: number
  length: number
  message: string
  suggestions: string[]
  severity: IssueSeverity
  original_text: string
}

export interface GrammarCheckRequest {
  text: string
  field_name?: string
}

export interface GrammarCheckResponse {
  issues: GrammarIssue[]
  checked_text: string
}

export interface RefineSuggestion {
  category: SuggestionCategory
  original: string
  suggested: string
  explanation: string
  field: 'title' | 'summary' | 'content'
}

export interface RefineRequest {
  title: string
  summary: string
  content: string
  tags: string[]
}

export interface RefineResponse {
  suggestions: RefineSuggestion[]
  overall_score: number
  summary: string
}

export interface RefineStreamChunk {
  type: 'progress' | 'suggestion' | 'score' | 'summary' | 'done' | 'error'
  data: RefineSuggestion | number | string | null
}

export interface TextEnhancementState {
  isCheckingGrammar: boolean
  isRefining: boolean
  grammarIssues: GrammarIssue[]
  refineSuggestions: RefineSuggestion[]
  overallScore: number | null
  refineSummary: string | null
  showGrammarPanel: boolean
  showRefinerPanel: boolean
}
