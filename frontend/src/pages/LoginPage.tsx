import { useState, FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { Button, Card } from '../components/common'

export const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const locationState = location.state as { from?: string; registered?: boolean } | null
  const registered = locationState?.registered

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const success = await login(username, password)

    if (success) {
      // Determine redirect based on user type
      // If there was a specific destination, use it for admin users only
      // Regular users go to homepage
      const from = locationState?.from
      if (from && from.startsWith('/admin')) {
        // Admin route - will be handled by ProtectedRoute if not admin
        navigate(from, { replace: true })
      } else {
        // For regular users or if no specific destination, go to homepage
        // The useAuthContext will have updated user by now
        navigate('/', { replace: true })
      }
    } else {
      setError('Invalid username or password')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Login
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Sign in to access the chat and more
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {registered && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
              Registration successful! Please sign in.
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
