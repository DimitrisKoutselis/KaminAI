export interface Article {
  id: string
  title: string
  slug: string
  content: string
  summary: string
  tags: string[]
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
  author: string
  image_url: string | null
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
  image_url?: string
  featured?: boolean
}

export interface ArticleUpdate {
  title?: string
  content?: string
  summary?: string
  tags?: string[]
  published?: boolean
  featured?: boolean
  image_url?: string
}
