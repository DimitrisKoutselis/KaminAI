import { Routes, Route } from 'react-router-dom'
import { Layout, ProtectedRoute } from './components/common'
import { HomePage } from './pages/HomePage'
import { BlogPage } from './pages/BlogPage'
import { ArticlePage } from './pages/ArticlePage'
import { PortfolioPage } from './pages/PortfolioPage'
import { AboutPage } from './pages/AboutPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { LoginPage } from './pages/LoginPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ArticleListAdmin } from './pages/admin/ArticleListAdmin'
import { ArticleEditor } from './pages/admin/ArticleEditor'
import { ReviewsAdmin } from './pages/admin/ReviewsAdmin'
import { ProfileSettings } from './pages/admin/ProfileSettings'
import { PinnedReposAdmin } from './pages/admin/PinnedReposAdmin'
import { NotFoundPage } from './pages/NotFoundPage'
import { AuthProvider } from './context/AuthContext'
import { ChatBubble } from './components/chat'

function App() {
  return (
    <AuthProvider>
      <ChatBubble />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<ArticlePage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/articles"
            element={
              <ProtectedRoute>
                <ArticleListAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/articles/new"
            element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/articles/:id/edit"
            element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reviews"
            element={
              <ProtectedRoute>
                <ReviewsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/pinned-repos"
            element={
              <ProtectedRoute>
                <PinnedReposAdmin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
