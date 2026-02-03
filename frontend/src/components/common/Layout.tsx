import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-950 dark:bg-black text-zinc-400 border-t border-transparent dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm">
              &copy; {currentYear} Dimitris Koutselis. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              All content, code, and materials on this website are protected by copyright law.
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <a
              href="mailto:dimitriskoytselis@gmail.com"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-600">
            Unauthorized reproduction, distribution, or modification of any content is strictly prohibited.
          </p>
        </div>
      </div>
    </footer>
  )
}

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/blog', label: 'Blog' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/about', label: 'About' },
]

export const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthContext()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black transition-colors duration-300">
      <nav className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-zinc-900 dark:text-white transition-colors">
                KaminAI
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Admin
                  </Link>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{user?.username}</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/login'
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex-grow w-full ${
        location.pathname === '/'
          ? ''
          : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
