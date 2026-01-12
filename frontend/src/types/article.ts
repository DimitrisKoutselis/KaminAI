export interface Article {
  id: string
  title: string
  slug: string
  content: string
  summary: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
  author: string
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
}

export interface ArticleCreate {
  title: string
  content: string
  summary: string
  tags: string[]
  author?: string
}

export interface ArticleUpdate {
  title?: string
  content?: string
  summary?: string
  tags?: string[]
  published?: boolean
}
