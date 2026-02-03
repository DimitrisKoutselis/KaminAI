import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { usePinnedRepos } from '../hooks/usePinnedRepos'
import { ArticleCard } from '../components/blog'
import { Button, Card } from '../components/common'
import { profileService } from '../services/profileService'
import { portfolioService } from '../services/portfolioService'
import type { PublicProfile } from '../types/profile'
import type { Project } from '../types/portfolio'
import type { MediaReview } from '../types/leaderboard'

const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-500',
  Rust: 'bg-orange-600',
  Go: 'bg-cyan-500',
  Java: 'bg-red-500',
  'C++': 'bg-pink-500',
  C: 'bg-gray-600',
  Ruby: 'bg-red-600',
  PHP: 'bg-indigo-400',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-500',
  Scala: 'bg-red-400',
  HTML: 'bg-orange-600',
  CSS: 'bg-blue-400',
  Shell: 'bg-green-600',
  Dockerfile: 'bg-blue-600',
}

export const HomePage = () => {
  const { articles, loading } = useArticles()
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard()
  const { pinnedRepos, loading: pinnedReposLoading } = usePinnedRepos()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const recentArticles = articles.slice(0, 3)

  useEffect(() => {
    profileService.getPublicProfile().then(setProfile).catch(console.error)
  }, [])

  useEffect(() => {
    portfolioService
      .getProjects()
      .then((data) => {
        setProjects(data)
        setProjectsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setProjectsLoading(false)
      })
  }, [])

  const getTopRatedMedia = (): MediaReview[] => {
    if (!leaderboard) return []
    const allMedia = [
      ...leaderboard.movies,
      ...leaderboard.series,
      ...leaderboard.games,
      ...leaderboard.books,
    ]
    return allMedia.sort((a, b) => b.rating - a.rating).slice(0, 5)
  }

  const totalArticles = articles.length
  const totalProjects = projects.length
  const totalReviews = leaderboard
    ? leaderboard.movies.length +
      leaderboard.series.length +
      leaderboard.games.length +
      leaderboard.books.length
    : 0

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-16">
        <section className="relative overflow-hidden max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ animationDelay: '4s' }} />

          <Card className="relative text-center py-8">
            <p className="text-blue-600 font-medium mb-4 animate-fade-in">
              Welcome to my corner of the internet
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-up">
              Hey, I&apos;m{' '}
              <span className="gradient-text">Dimitris</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up-delay-1">
              AI Engineer crafting intelligent systems with LangGraph, RAG, and a whole lot of curiosity.
              I write about what I learn and build things that excite me.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up-delay-2">
              <Link to="/blog">
                <Button size="lg" className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
                  Read My Blog
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
                  View Portfolio
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200">
                  About Me
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>

      {/* Skills Section */}
      {profile && profile.skills.length > 0 && (
        <div className="bg-white py-12">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills & Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </section>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-12">
        <section className="animate-slide-up-delay-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-2">
                <span role="img" aria-label="articles">
                  📝
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {loading ? '...' : totalArticles}
              </p>
              <p className="text-gray-500 mt-1">Articles Written</p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-2">
                <span role="img" aria-label="projects">
                  💻
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {projectsLoading ? '...' : totalProjects}
              </p>
              <p className="text-gray-500 mt-1">Projects Built</p>
            </Card>
            <Card className="text-center">
              <div className="text-4xl mb-2">
                <span role="img" aria-label="reviews">
                  🎬
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {leaderboardLoading ? '...' : totalReviews}
              </p>
              <p className="text-gray-500 mt-1">Reviews</p>
            </Card>
          </div>
        </section>
      </div>

      {/* Pinned GitHub Repos Section */}
      {!pinnedReposLoading && pinnedRepos.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Pinned Repositories
                </h2>
                <p className="text-gray-400 mt-1">Featured open source projects</p>
              </div>
              <Link
                to="/portfolio"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group"
              >
                View all projects
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                  &rarr;
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedRepos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm0 6h10v2H7v-2zm6-6h4v4h-4V7z"/>
                      </svg>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {repo.display_name}
                      </h3>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    {repo.language && (
                      <span className="flex items-center gap-1.5 text-gray-300">
                        <span className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-gray-500'}`} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 5C7 3.89543 7.89543 3 9 3C10.1046 3 11 3.89543 11 5C11 5.74028 10.5978 6.38663 10 6.73244V14.0396H14.7915C15.2367 13.1292 16.1936 12.5 17.3077 12.5C18.8638 12.5 20.1154 13.7239 20.1154 15.2462C20.1154 16.7685 18.8638 17.9923 17.3077 17.9923C16.1936 17.9923 15.2367 17.3631 14.7915 16.4527H9C8.44772 16.4527 8 16.005 8 15.4527V6.73244C7.40219 6.38663 7 5.74028 7 5Z"/>
                      </svg>
                      {repo.forks}
                    </span>
                  </div>
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">
                          +{repo.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Top Rated Section */}
      {!leaderboardLoading && getTopRatedMedia().length > 0 && (
        <div className="bg-gradient-to-b from-amber-50 to-orange-50 py-16">
          <section className="animate-slide-up-delay-2 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Top Rated</h2>
                <p className="text-gray-500 mt-1">My highest rated entertainment</p>
              </div>
              <Link
                to="/leaderboard"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
              >
                View all ratings
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                  &rarr;
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {getTopRatedMedia().map((review) => (
                <div
                  key={review.id}
                  className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {review.poster_url ? (
                    <img
                      src={review.poster_url}
                      alt={review.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">
                        {review.media_type === 'movie' && '🎬'}
                        {review.media_type === 'series' && '📺'}
                        {review.media_type === 'game' && '🎮'}
                        {review.media_type === 'book' && '📚'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm truncate">{review.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400 font-bold">{review.rating}/10</span>
                      <span className="text-gray-300 text-xs capitalize">{review.media_type}</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 font-bold text-sm px-2 py-1 rounded-full">
                    {review.rating}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Currently Into Section */}
      {profile && profile.currently && profile.currently.length > 0 && (
        <div className="bg-white py-12">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What I'm Currently Into</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {profile.currently.map((item, index) => {
                  const categoryConfig = {
                    reading: { icon: '📖', label: 'Reading', color: 'bg-amber-100 text-amber-700', cardBg: 'bg-amber-50 border-amber-200' },
                    watching: { icon: '📺', label: 'Watching', color: 'bg-blue-100 text-blue-700', cardBg: 'bg-blue-50 border-blue-200' },
                    playing: { icon: '🎮', label: 'Playing', color: 'bg-green-100 text-green-700', cardBg: 'bg-green-50 border-green-200' },
                    working_on: { icon: '💻', label: 'Working On', color: 'bg-purple-100 text-purple-700', cardBg: 'bg-purple-50 border-purple-200' },
                  }
                  const config = categoryConfig[item.category] || categoryConfig.working_on

                  return (
                    <div
                      key={index}
                      className={`rounded-lg p-4 border hover:shadow-md transition-shadow ${config.cardBg}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{config.icon}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded shadow-sm"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                            >
                              {item.title}
                            </a>
                          ) : (
                            <p className="font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                          )}
                          {item.subtitle && (
                            <p className="text-sm text-gray-500 mt-1 truncate">{item.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </section>
        </div>
      )}

      {/* Featured Article Section */}
      {!loading && articles.find((a) => a.featured) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⭐</span>
              <h2 className="text-3xl font-bold text-gray-900">Featured Article</h2>
            </div>
            {(() => {
              const featuredArticle = articles.find((a) => a.featured)!
              return (
                <Link
                  to={`/blog/${featuredArticle.slug}`}
                  className="block transform hover:scale-[1.01] transition-transform duration-200"
                >
                  <Card className="bg-white/80 backdrop-blur border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                            Featured
                          </span>
                          {featuredArticle.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {featuredArticle.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {featuredArticle.summary}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {new Date(featuredArticle.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-blue-600 font-medium">Read more &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })()}
          </section>
        </div>
      )}

      {/* Divider */}
      <div className="bg-white py-8">
        <div className="flex items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-16 bg-gray-300" />
          <div className="mx-4 w-2 h-2 rounded-full bg-blue-500" />
          <div className="h-px w-16 bg-gray-300" />
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <section className="animate-slide-up-delay-3 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recent Articles</h2>
              <p className="text-gray-500 mt-1">Thoughts, learnings, and experiments</p>
            </div>
            <Link
              to="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
            >
              View all
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.filter((a) => !a.featured).map((article) => (
                <div
                  key={article.id}
                  className="transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200"
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-gray-500 mb-4">No articles yet. Stay tuned!</p>
              <p className="text-sm text-gray-400">I&apos;m working on some exciting content.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
