export interface MediaReview {
  id: string
  title: string
  media_type: 'movie' | 'series' | 'game' | 'book'
  rating: number
  year: string | null
  external_id: string | null
  external_url: string | null
  poster_url: string | null
  article_id: string | null
  article_slug: string
  article_title: string
  created_at: string
}

export interface MediaReviewCreate {
  title: string
  media_type: 'movie' | 'series' | 'game' | 'book'
  rating: number
  year?: string
  article_id?: string
}

export interface LeaderboardResponse {
  movies: MediaReview[]
  series: MediaReview[]
  games: MediaReview[]
  books: MediaReview[]
}

export interface MediaReviewListResponse {
  reviews: MediaReview[]
  total: number
}

export interface MediaSearchResult {
  title: string
  year: string | null
  poster_url: string | null
  external_url: string | null
  external_id: string
}
