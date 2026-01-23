import api from './api'
import type { LoginRequest, LoginResponse, User } from '../types/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials)
    const data: LoginResponse = response.data

    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        username: data.username,
        is_admin: data.is_admin,
        first_name: data.first_name,
        last_name: data.last_name,
        nickname: data.nickname,
        birthday: data.birthday,
        display_name: data.display_name,
      })
    )

    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`

    return data
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete api.defaults.headers.common['Authorization']
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  initAuth(): void {
    const token = this.getToken()
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },
}

authService.initAuth()
