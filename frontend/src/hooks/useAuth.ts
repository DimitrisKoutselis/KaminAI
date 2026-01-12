import { useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import type { User } from '../types/auth'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(() => {
    const storedToken = authService.getToken()
    const storedUser = authService.getUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    } else {
      setToken(null)
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login({ username, password })
      setToken(response.access_token)
      setUser({
        username: response.username,
        is_admin: response.is_admin,
        first_name: response.first_name,
        last_name: response.last_name,
        nickname: response.nickname,
        birthday: response.birthday,
        display_name: response.display_name,
      })
      setIsLoading(false)
      return true
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Invalid credentials'
      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }

  const logout = useCallback(() => {
    authService.logout()
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  }
}
