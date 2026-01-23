export interface ContactLink {
  platform: string
  url: string
  label: string
}

export interface WorkExperience {
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string
  is_current: boolean
}

export interface AboutSection {
  id: string
  title: string
  content: string
}

export interface CurrentlyItem {
  category: 'reading' | 'watching' | 'playing' | 'working_on'
  title: string
  subtitle?: string
  url?: string
  image_url?: string
}

export interface PublicProfile {
  first_name: string
  last_name: string
  nickname: string
  display_name: string
  bio: string
  skills: string[]
  work_experience: WorkExperience[]
  about_sections: AboutSection[]
  contact_links: ContactLink[]
  currently: CurrentlyItem[]
}

export interface AdminProfile extends PublicProfile {
  username: string
  birthday: string | null
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  nickname?: string
  birthday?: string
  bio?: string
  skills?: string[]
  work_experience?: WorkExperience[]
  about_sections?: AboutSection[]
  contact_links?: ContactLink[]
  currently?: CurrentlyItem[]
}

export interface UpdateCredentialsRequest {
  current_password: string
  username?: string
  new_password?: string
}
