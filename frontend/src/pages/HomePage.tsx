import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { ArticleCard } from '../components/blog'
import { Button, Card } from '../components/common'
import { profileService } from '../services/profileService'
import { portfolioService } from '../services/portfolioService'
import type { PublicProfile } from '../types/profile'
import type { Project } from '../types/portfolio'
import type { MediaReview } from '../types/leaderboard'

export const HomePage = () => {
  const { articles, loading } = useArticles()
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard()
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
    <div className="space-y-16">
      <section className="relative overflow-hidden">
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

      {profile && profile.skills.length > 0 && (
        <section className="animate-slide-up">
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
      )}

      <section className="animate-slide-up-delay-1">
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

      {!leaderboardLoading && getTopRatedMedia().length > 0 && (
        <section className="animate-slide-up-delay-2">
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
      )}

      {profile && profile.currently && profile.currently.length > 0 && (
        <section className="animate-slide-up">
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
      )}

      {!loading && articles.find((a) => a.featured) && (
        <section className="animate-slide-up">
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
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          Featured
                        </span>
                        {featuredArticle.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/50 text-blue-700 text-xs font-medium rounded-full"
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
      )}

      <div className="flex items-center justify-center">
        <div className="h-px w-16 bg-gray-300" />
        <div className="mx-4 w-2 h-2 rounded-full bg-blue-500" />
        <div className="h-px w-16 bg-gray-300" />
      </div>

      <section className="animate-slide-up-delay-3">
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
  )
}
