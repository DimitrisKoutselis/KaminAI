import api from './api'
import type {
  PublicProfile,
  AdminProfile,
  UpdateProfileRequest,
  UpdateCredentialsRequest,
} from '../types/profile'

export const profileService = {
  async getPublicProfile(): Promise<PublicProfile> {
    const response = await api.get<PublicProfile>('/profile')
    return response.data
  },

  async getAdminProfile(): Promise<AdminProfile> {
    const response = await api.get<AdminProfile>('/profile/admin')
    return response.data
  },

  async updateProfile(data: UpdateProfileRequest): Promise<AdminProfile> {
    const response = await api.put<AdminProfile>('/profile/admin', data)
    return response.data
  },

  async updateCredentials(data: UpdateCredentialsRequest): Promise<AdminProfile> {
    const response = await api.put<AdminProfile>('/profile/admin/credentials', data)
    return response.data
  },
}

export default profileService
