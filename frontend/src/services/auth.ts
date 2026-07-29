import api from './api'
import type { User } from '@/types'

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    return data
  },

  async register(
    name: string,
    email: string,
    password: string,
    role: string = 'customer'
  ): Promise<User> {
    const { data } = await api.post<User>('/auth/register', {
      name,
      email,
      password,
      role,
    })
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/profile')
    return data
  },

  async refreshToken(token: string): Promise<{ access_token: string }> {
    const { data } = await api.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: token,
    })
    return data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      '/auth/forgot-password',
      { email }
    )
    return data
  },

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      '/auth/reset-password',
      { token, password }
    )
    return data
  },
}
