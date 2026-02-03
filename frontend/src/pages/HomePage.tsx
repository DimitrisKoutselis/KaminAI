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
  TypeScript: 'bg-zinc-600',
  JavaScript: 'bg-zinc-500',
  Python: 'bg-zinc-600',
  Rust: 'bg-zinc-700',
  Go: 'bg-zinc-500',
  Java: 'bg-zinc-600',
  'C++': 'bg-zinc-700',
  C: 'bg-zinc-600',
  Ruby: 'bg-zinc-600',
  PHP: 'bg-zinc-500',
  Swift: 'bg-zinc-600',
  Kotlin: 'bg-zinc-600',
  Scala: 'bg-zinc-500',
  HTML: 'bg-zinc-600',
  CSS: 'bg-zinc-500',
  Shell: 'bg-zinc-600',
  Dockerfile: 'bg-zinc-600',
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
      <div className="bg-white dark:bg-zinc-950 py-20 transition-colors duration-300">
        <section className="relative overflow-hidden max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-zinc-200 dark:bg-zinc-800 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-zinc-300 dark:bg-zinc-700 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-zinc-200 dark:bg-zinc-800 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-blob" style={{ animationDelay: '4s' }} />

          <div className="relative text-center py-8">
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-4 animate-fade-in tracking-wide uppercase text-sm">
              Welcome to my corner of the internet
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white mb-6 animate-slide-up tracking-tight">
              Hey, I&apos;m{' '}
              <span className="text-zinc-900 dark:text-white">Dimitris</span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mb-12 animate-slide-up-delay-1">
              AI Engineer crafting intelligent systems with LangGraph, RAG, and a whole lot of curiosity.
              I write about what I learn and build things that excite me.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up-delay-2">
              <Link to="/blog">
                <Button size="lg" className="w-full sm:w-auto">
                  Read My Blog
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Portfolio
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  About Me
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Skills Section */}
      {profile && profile.skills.length > 0 && (
        <div className="bg-zinc-50 dark:bg-black py-16 transition-colors duration-300">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Skills & Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-white dark:bg-zinc-950 py-16 transition-colors duration-300">
        <section className="animate-slide-up-delay-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-5xl font-bold text-zinc-900 dark:text-white mb-2">
                {loading ? '...' : totalArticles}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wide text-sm">Articles Written</p>
            </div>
            <div className="text-center p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-5xl font-bold text-zinc-900 dark:text-white mb-2">
                {projectsLoading ? '...' : totalProjects}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wide text-sm">Projects Built</p>
            </div>
            <div className="text-center p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-5xl font-bold text-zinc-900 dark:text-white mb-2">
                {leaderboardLoading ? '...' : totalReviews}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wide text-sm">Reviews</p>
            </div>
          </div>
        </section>
      </div>

      {/* Pinned GitHub Repos Section */}
      {!pinnedReposLoading && pinnedRepos.length > 0 && (
        <div className="bg-zinc-950 dark:bg-black py-20 transition-colors duration-300">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Pinned Repositories
                </h2>
                <p className="text-zinc-500 mt-2">Featured open source projects</p>
              </div>
              <Link
                to="/portfolio"
                className="text-zinc-400 hover:text-white font-medium flex items-center gap-1 group"
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
                  className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm0 6h10v2H7v-2zm6-6h4v4h-4V7z"/>
                      </svg>
                      <h3 className="font-semibold text-white group-hover:text-zinc-300 transition-colors truncate">
                        {repo.display_name}
                      </h3>
                    </div>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <p className="text-zinc-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    {repo.language && (
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className={`w-3 h-3 rounded-full ${languageColors[repo.language] || 'bg-zinc-500'}`} />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-zinc-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
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
                          className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span className="px-2 py-0.5 text-zinc-600 text-xs">
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
        <div className="bg-zinc-50 dark:bg-zinc-900 py-20 transition-colors duration-300">
          <section className="animate-slide-up-delay-2 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Top Rated</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">My highest rated entertainment</p>
              </div>
              <Link
                to="/leaderboard"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium flex items-center gap-1 group"
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
                  className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {review.poster_url ? (
                    <img
                      src={review.poster_url}
                      alt={review.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <span className="text-4xl text-zinc-400 dark:text-zinc-600">
                        {review.media_type === 'movie' && '?'}
                        {review.media_type === 'series' && '?'}
                        {review.media_type === 'game' && '?'}
                        {review.media_type === 'book' && '?'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm truncate">{review.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-bold">{review.rating}/10</span>
                      <span className="text-zinc-400 text-xs capitalize">{review.media_type}</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-white text-zinc-900 font-bold text-sm px-2 py-1 rounded-full">
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
        <div className="bg-white dark:bg-zinc-950 py-16 transition-colors duration-300">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">What I'm Currently Into</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.currently.map((item, index) => {
                const categoryConfig = {
                  reading: { label: 'Reading', borderColor: 'border-zinc-300 dark:border-zinc-700' },
                  watching: { label: 'Watching', borderColor: 'border-zinc-300 dark:border-zinc-700' },
                  playing: { label: 'Playing', borderColor: 'border-zinc-300 dark:border-zinc-700' },
                  working_on: { label: 'Working On', borderColor: 'border-zinc-300 dark:border-zinc-700' },
                }
                const config = categoryConfig[item.category] || categoryConfig.working_on

                return (
                  <div
                    key={index}
                    className={`rounded-xl p-5 border-2 ${config.borderColor} bg-white dark:bg-zinc-900 hover:shadow-md transition-all`}
                  >
                    <div className="mb-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
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
                            className="font-semibold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors line-clamp-2"
                          >
                            {item.title}
                          </a>
                        ) : (
                          <p className="font-semibold text-zinc-900 dark:text-white line-clamp-2">{item.title}</p>
                        )}
                        {item.subtitle && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* Featured Article Section */}
      {!loading && articles.find((a) => a.featured) && (
        <div className="bg-zinc-50 dark:bg-black py-16 transition-colors duration-300">
          <section className="animate-slide-up max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Featured Article</h2>
            {(() => {
              const featuredArticle = articles.find((a) => a.featured)!
              return (
                <Link
                  to={`/blog/${featuredArticle.slug}`}
                  className="block"
                >
                  <Card className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-full">
                            Featured
                          </span>
                          {featuredArticle.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                          {featuredArticle.title}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-300 mb-4 line-clamp-3">
                          {featuredArticle.summary}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                          <span>
                            {new Date(featuredArticle.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-zinc-900 dark:text-zinc-200 font-medium">Read more &rarr;</span>
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
      <div className="bg-white dark:bg-zinc-950 py-8 transition-colors duration-300">
        <div className="flex items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-16 bg-zinc-300 dark:bg-zinc-700" />
          <div className="mx-4 w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
          <div className="h-px w-16 bg-zinc-300 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="bg-white dark:bg-zinc-950 py-16 transition-colors duration-300">
        <section className="animate-slide-up-delay-3 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Recent Articles</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2">Thoughts, learnings, and experiments</p>
            </div>
            <Link
              to="/blog"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium flex items-center gap-1 group"
            >
              View all
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.filter((a) => !a.featured).map((article) => (
                <div
                  key={article.id}
                  className="transform hover:-translate-y-1 transition-transform duration-200"
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">No articles yet. Stay tuned!</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">I&apos;m working on some exciting content.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
