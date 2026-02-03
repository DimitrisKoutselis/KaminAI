import { useState, useEffect } from 'react'
import { Card } from '../components/common'
import { profileService } from '../services/profileService'
import type { PublicProfile, ContactLink, WorkExperience } from '../types/profile'

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'github':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
          />
        </svg>
      )
    case 'email':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'twitter':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      )
  }
}

const ContactLinkButton = ({ link }: { link: ContactLink }) => {
  const isExternal = !link.url.startsWith('mailto:')

  return (
    <a
      href={link.url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors bg-zinc-900 hover:bg-zinc-800"
    >
      <PlatformIcon platform={link.platform} />
      {link.label}
    </a>
  )
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const WorkTimeline = ({ experiences }: { experiences: WorkExperience[] }) => {
  const sortedExperiences = [...experiences].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-300" />

      <div className="space-y-8">
        {sortedExperiences.map((exp, index) => (
          <div key={index} className="relative pl-12">
            <div
              className={`absolute left-2 w-5 h-5 rounded-full border-4 border-white shadow-md ${
                exp.is_current ? 'bg-zinc-900' : 'bg-zinc-400'
              }`}
            />

            <div className="bg-white rounded-lg p-4 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="font-semibold text-zinc-900">{exp.role}</h3>
                <span className="text-sm text-zinc-500">
                  {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </span>
              </div>
              <p className="text-zinc-700 font-medium mb-2">{exp.company}</p>
              <p className="text-zinc-600 text-sm">{exp.description}</p>
              {exp.is_current && (
                <span className="inline-block mt-2 px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-full">
                  Current Position
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const AboutPage = () => {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getPublicProfile()
        setProfile(data)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="mb-10 animate-pulse">
          <div className="h-10 bg-zinc-200 rounded w-1/3 mb-3" />
          <div className="h-6 bg-zinc-200 rounded w-1/2" />
        </Card>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-8 animate-pulse">
            <div className="h-6 bg-zinc-200 rounded w-1/4 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-zinc-200 rounded" />
              <div className="h-4 bg-zinc-200 rounded w-5/6" />
              <div className="h-4 bg-zinc-200 rounded w-4/6" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <p className="text-zinc-600">{error || 'Failed to load profile'}</p>
        </Card>
      </div>
    )
  }

  const skillsSection = profile.about_sections.find((s) => s.id === 'skills')
  const otherSections = profile.about_sections.filter((s) => s.id !== 'skills')

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-5 animate-fade-in">
        <h1 className="text-4xl font-bold text-zinc-900 mb-3">About Me</h1>
        <p className="text-lg text-zinc-500">The person behind the code</p>
      </Card>

      {otherSections.map((section, index) => (
        <Card
          key={section.id}
          className={`mb-4 ${index < 4 ? `animate-slide-up-delay-${index}` : ''}`}
        >
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            {section.title}
          </h2>
          <div className="text-zinc-600 whitespace-pre-line">{section.content}</div>

          {skillsSection && section.id === skillsSection.id && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </Card>
      ))}

      {skillsSection && (
        <Card className="mb-4 animate-slide-up-delay-2">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            {skillsSection.title}
          </h2>
          <div className="text-zinc-600 whitespace-pre-line mb-4">
            {skillsSection.content}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      {profile.work_experience.length > 0 && (
        <Card className="mb-4 animate-slide-up-delay-3">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">
            Work Experience
          </h2>
          <WorkTimeline experiences={profile.work_experience} />
        </Card>
      )}

      {profile.contact_links.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Let&apos;s Connect
          </h2>
          <p className="text-zinc-600 mb-6">
            Feel free to reach out if you want to chat, collaborate on something
            interesting, or just say hi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {profile.contact_links.map((link, index) => (
              <ContactLinkButton key={index} link={link} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
