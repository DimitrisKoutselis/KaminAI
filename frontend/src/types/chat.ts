export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export interface ChatRequest {
  message: string
  conversation_history: ChatMessage[]
}

export interface ChatResponse {
  response: string
}

export interface IndexStats {
  total_documents: number
  projects: string[]
  file_types: string[]
}

export interface StreamChunk {
  content?: string
  done?: boolean
  error?: string
}
