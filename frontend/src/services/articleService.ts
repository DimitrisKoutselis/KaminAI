import api from './api'
import type { Article, ArticleListResponse, ArticleCreate, ArticleUpdate } from '../types/article'

export const articleService = {
  async getArticles(publishedOnly = true): Promise<ArticleListResponse> {
    const response = await api.get('/articles', {
      params: { published_only: publishedOnly },
    })
    return response.data
  },

  async getArticle(id: string): Promise<Article> {
    const response = await api.get(`/articles/${id}`)
    return response.data
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await api.get(`/articles/slug/${slug}`)
    return response.data
  },

  async createArticle(article: ArticleCreate): Promise<Article> {
    const response = await api.post('/articles', article)
    return response.data
  },

  async updateArticle(id: string, article: ArticleUpdate): Promise<Article> {
    const response = await api.put(`/articles/${id}`, article)
    return response.data
  },

  async deleteArticle(id: string): Promise<void> {
    await api.delete(`/articles/${id}`)
  },

  async publishArticle(id: string): Promise<Article> {
    const response = await api.post(`/articles/${id}/publish`)
    return response.data
  },

  async unpublishArticle(id: string): Promise<Article> {
    const response = await api.post(`/articles/${id}/unpublish`)
    return response.data
  },
}
