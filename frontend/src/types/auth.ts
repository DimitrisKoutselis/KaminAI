export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  username: string
  is_admin: boolean
  first_name?: string
  last_name?: string
  nickname?: string
  birthday?: string
  display_name?: string
}

export interface User {
  username: string
  is_admin: boolean
  first_name?: string
  last_name?: string
  nickname?: string
  birthday?: string
  display_name?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface RegisterResponse {
  id: string
  username: string
  message: string
}

export interface MessageLimitResponse {
  remaining_messages: number
  max_messages: number
  is_unlimited: boolean
}
