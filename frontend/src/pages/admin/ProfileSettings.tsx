import { useState, useEffect } from 'react'
import { Card, Button } from '../../components/common'
import { profileService } from '../../services/profileService'
import { leaderboardService } from '../../services/leaderboardService'
import type {
  AdminProfile,
  WorkExperience,
  AboutSection,
  ContactLink,
  CurrentlyItem,
} from '../../types/profile'

type TabId = 'basic' | 'credentials' | 'bio' | 'experience' | 'sections' | 'contact' | 'currently'

export const ProfileSettings = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [lookupLoading, setLookupLoading] = useState<number | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [bio, setBio] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([])
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([])
  const [currently, setCurrently] = useState<CurrentlyItem[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await profileService.getAdminProfile()
      setProfile(data)
      setFirstName(data.first_name)
      setLastName(data.last_name)
      setNickname(data.nickname)
      setBirthday(data.birthday || '')
      setUsername(data.username)
      setBio(data.bio)
      setSkillsText(data.skills.join(', '))
      setWorkExperience(data.work_experience)
      setAboutSections(data.about_sections)
      setContactLinks(data.contact_links)
      setCurrently(data.currently || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBasicInfo = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await profileService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        nickname: nickname,
        birthday: birthday || undefined,
      })
      setSuccess('Basic info saved successfully')
      fetchProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save basic info')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCredentials = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (!currentPassword) {
      setError('Current password is required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await profileService.updateCredentials({
        current_password: currentPassword,
        username: username !== profile?.username ? username : undefined,
        new_password: newPassword || undefined,
      })
      setSuccess('Credentials saved successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      fetchProfile()
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.response?.data?.detail || 'Failed to save credentials')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBio = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean)
      await profileService.updateProfile({
        bio: bio,
        skills: skills,
      })
      setSuccess('Bio and skills saved successfully')
      fetchProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save bio and skills')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWorkExperience = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await profileService.updateProfile({
        work_experience: workExperience,
      })
      setSuccess('Work experience saved successfully')
      fetchProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save work experience')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAboutSections = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await profileService.updateProfile({
        about_sections: aboutSections,
      })
      setSuccess('About sections saved successfully')
      fetchProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save about sections')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContactLinks = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await profileService.updateProfile({
        contact_links: contactLinks,
      })
      setSuccess('Contact links saved successfully')
      fetchProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save contact links')
    } finally {
      setSaving(false)
    }
  }

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      {
        company: '',
        role: '',
        start_date: '',
        end_date: null,
        description: '',
        is_current: false,
      },
    ])
  }

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index))
  }

  const updateWorkExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string | boolean | null
  ) => {
    const updated = [...workExperience]
    updated[index] = { ...updated[index], [field]: value }
    setWorkExperience(updated)
  }

  const addAboutSection = () => {
    setAboutSections([
      ...aboutSections,
      {
        id: `section_${Date.now()}`,
        title: '',
        content: '',
      },
    ])
  }

  const removeAboutSection = (index: number) => {
    setAboutSections(aboutSections.filter((_, i) => i !== index))
  }

  const updateAboutSection = (
    index: number,
    field: keyof AboutSection,
    value: string
  ) => {
    const updated = [...aboutSections]
    updated[index] = { ...updated[index], [field]: value }
    setAboutSections(updated)
  }

  const addContactLink = () => {
    setContactLinks([
      ...contactLinks,
      {
        platform: '',
        url: '',
        label: '',
      },
    ])
  }

  const removeContactLink = (index: number) => {
    setContactLinks(contactLinks.filter((_, i) => i !== index))
  }

  const updateContactLink = (
    index: number,
    field: keyof ContactLink,
    value: string
  ) => {
    const updated = [...contactLinks]
    updated[index] = { ...updated[index], [field]: value }
    setContactLinks(updated)
  }

  const handleSaveCurrently = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await profileService.updateProfile({
        currently: currently,
      })
      setSuccess('Currently section saved successfully')
      fetchProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save currently section')
    } finally {
      setSaving(false)
    }
  }

  const addCurrentlyItem = () => {
    setCurrently([
      ...currently,
      {
        category: 'reading',
        title: '',
        subtitle: undefined,
        url: undefined,
        image_url: undefined,
      },
    ])
  }

  const removeCurrentlyItem = (index: number) => {
    setCurrently(currently.filter((_, i) => i !== index))
  }

  const updateCurrentlyItem = (
    index: number,
    field: keyof CurrentlyItem,
    value: string | undefined
  ) => {
    const updated = [...currently]
    updated[index] = { ...updated[index], [field]: value } as CurrentlyItem
    setCurrently(updated)
  }

  const lookupCurrentlyItem = async (index: number) => {
    const item = currently[index]
    if (!item.title) {
      setError('Please enter a title to lookup')
      return
    }

    const categoryToMediaType: Record<string, string> = {
      reading: 'book',
      watching: 'series', // Default to series, could also be movie
      playing: 'game',
      working_on: '', // No lookup for working_on
    }

    const mediaType = categoryToMediaType[item.category]
    if (!mediaType) {
      setError('Lookup is only available for reading, watching, and playing categories')
      return
    }

    setLookupLoading(index)
    setError(null)

    try {
      let result = await leaderboardService.searchMedia(item.title, mediaType)

      if (!result && item.category === 'watching') {
        result = await leaderboardService.searchMedia(item.title, 'movie')
      }

      if (result) {
        const updated = [...currently]
        updated[index] = {
          ...updated[index],
          title: result.title,
          url: result.external_url || undefined,
          image_url: result.poster_url || undefined,
          subtitle: result.year ? `(${result.year})` : undefined,
        }
        setCurrently(updated)
        setSuccess(`Found: ${result.title}`)
      } else {
        setError(`No results found for "${item.title}"`)
      }
    } catch (err) {
      console.error('Lookup error:', err)
      setError('Failed to lookup media. Please try again.')
    } finally {
      setLookupLoading(null)
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'bio', label: 'Bio & Skills' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'sections', label: 'About Sections' },
    { id: 'contact', label: 'Contact Links' },
    { id: 'currently', label: 'Currently' },
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <Card>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <p className="text-green-600">{success}</p>
        </Card>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-1">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2.5 px-4 rounded-md font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'basic' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nickname (Display Name)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="If set, will be used as display name instead of First Last"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveBasicInfo} disabled={saving}>
                {saving ? 'Saving...' : 'Save Basic Info'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'credentials' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password (required to save changes)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveCredentials} disabled={saving}>
                {saving ? 'Saving...' : 'Save Credentials'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'bio' && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio & Skills</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Python, FastAPI, React, TypeScript"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current skills: {skillsText.split(',').filter((s) => s.trim()).length}
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveBio} disabled={saving}>
                {saving ? 'Saving...' : 'Save Bio & Skills'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'experience' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
            <Button onClick={addWorkExperience} variant="secondary">
              Add Experience
            </Button>
          </div>
          <div className="space-y-6">
            {workExperience.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Experience #{index + 1}
                  </span>
                  <button
                    onClick={() => removeWorkExperience(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateWorkExperience(index, 'company', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) =>
                        updateWorkExperience(index, 'role', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (YYYY-MM)
                    </label>
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) =>
                        updateWorkExperience(index, 'start_date', e.target.value)
                      }
                      placeholder="2024-01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (YYYY-MM or empty if current)
                    </label>
                    <input
                      type="text"
                      value={exp.end_date || ''}
                      onChange={(e) =>
                        updateWorkExperience(
                          index,
                          'end_date',
                          e.target.value || null
                        )
                      }
                      placeholder="2024-12"
                      disabled={exp.is_current}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateWorkExperience(index, 'description', e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exp.is_current}
                      onChange={(e) =>
                        updateWorkExperience(index, 'is_current', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Currently working here
                    </span>
                  </label>
                </div>
              </div>
            ))}
            {workExperience.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No work experience added yet.
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveWorkExperience} disabled={saving}>
                {saving ? 'Saving...' : 'Save Work Experience'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'sections' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">About Page Sections</h2>
            <Button onClick={addAboutSection} variant="secondary">
              Add Section
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            These sections will appear on your About page. Drag to reorder (coming soon).
          </p>
          <div className="space-y-6">
            {aboutSections.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Section #{index + 1}
                  </span>
                  <button
                    onClick={() => removeAboutSection(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section ID (for internal reference)
                    </label>
                    <input
                      type="text"
                      value={section.id}
                      onChange={(e) =>
                        updateAboutSection(index, 'id', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateAboutSection(index, 'title', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) =>
                        updateAboutSection(index, 'content', e.target.value)
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            {aboutSections.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No about sections added yet.
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveAboutSections} disabled={saving}>
                {saving ? 'Saving...' : 'Save About Sections'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'contact' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact Links</h2>
            <Button onClick={addContactLink} variant="secondary">
              Add Link
            </Button>
          </div>
          <div className="space-y-6">
            {contactLinks.map((link, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Link #{index + 1}
                  </span>
                  <button
                    onClick={() => removeContactLink(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        updateContactLink(index, 'platform', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select platform</option>
                      <option value="github">GitHub</option>
                      <option value="email">Email</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="website">Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) =>
                        updateContactLink(index, 'url', e.target.value)
                      }
                      placeholder="https://... or mailto:..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) =>
                        updateContactLink(index, 'label', e.target.value)
                      }
                      placeholder="GitHub, Email Me, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {contactLinks.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No contact links added yet.
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveContactLinks} disabled={saving}>
                {saving ? 'Saving...' : 'Save Contact Links'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'currently' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">What I'm Currently Into</h2>
            <Button onClick={addCurrentlyItem} variant="secondary">
              Add Item
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Share what you're currently reading, watching, playing, or working on. These will appear on your homepage.
          </p>
          <div className="space-y-6">
            {currently.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Item #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.category !== 'working_on' && (
                      <button
                        onClick={() => lookupCurrentlyItem(index)}
                        disabled={lookupLoading === index || !item.title}
                        className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
                      >
                        {lookupLoading === index ? 'Looking up...' : 'Lookup'}
                      </button>
                    )}
                    <button
                      onClick={() => removeCurrentlyItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        updateCurrentlyItem(index, 'category', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="reading">Reading (Book)</option>
                      <option value="watching">Watching (Movie/Series)</option>
                      <option value="playing">Playing (Game)</option>
                      <option value="working_on">Working On (Manual)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title * {item.category !== 'working_on' && <span className="text-gray-400 font-normal">(Enter title, then click Lookup)</span>}
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateCurrentlyItem(index, 'title', e.target.value)
                      }
                      placeholder={item.category === 'reading' ? 'e.g., The Pragmatic Programmer' :
                                   item.category === 'watching' ? 'e.g., Breaking Bad' :
                                   item.category === 'playing' ? 'e.g., Elden Ring' :
                                   'e.g., My Next Project'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle (optional)
                    </label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) =>
                        updateCurrentlyItem(index, 'subtitle', e.target.value || undefined)
                      }
                      placeholder="e.g., by David Thomas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL (optional)
                    </label>
                    <input
                      type="text"
                      value={item.url || ''}
                      onChange={(e) =>
                        updateCurrentlyItem(index, 'url', e.target.value || undefined)
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (optional)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={item.image_url || ''}
                        onChange={(e) =>
                          updateCurrentlyItem(index, 'image_url', e.target.value || undefined)
                        }
                        placeholder="https://... (cover image)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt="Preview"
                          className="w-12 h-16 object-cover rounded shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {currently.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No items added yet. Add what you're currently reading, watching, playing, or working on!
              </p>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveCurrently} disabled={saving}>
                {saving ? 'Saving...' : 'Save Currently Section'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
