import api from './api'
import type { User, AuthTokens, ApiResponse } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/login', {
      email,
      password,
    })
    return data.data
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>('/auth/register', {
      name,
      email,
      password,
    })
    return data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/profile')
    return data.data
  },

  async refreshToken(token: string): Promise<AuthTokens> {
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken: token,
    })
    return data.data
  },
}
