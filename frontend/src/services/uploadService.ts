import api from './api'

export interface UploadResponse {
  filename: string
  url: string
  markdown: string
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('auth_token')
    const response = await api.post<UploadResponse>('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    return response.data
  },
}
