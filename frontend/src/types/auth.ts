export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  username: string
  is_admin: boolean
  first_name: string
  last_name: string
  nickname: string
  birthday: string
  display_name: string
}

export interface User {
  username: string
  is_admin: boolean
  first_name: string
  last_name: string
  nickname: string
  birthday: string
  display_name: string
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
