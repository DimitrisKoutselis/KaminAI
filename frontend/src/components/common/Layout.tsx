import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm">
              &copy; {currentYear} Dimitris Koutselis. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-1">
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
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
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
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin
                  </Link>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{user?.username}</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
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
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
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
