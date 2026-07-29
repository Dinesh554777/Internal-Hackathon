import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    logout: storeLogout,
  } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
      navigate('/')
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string
      email: string
      password: string
    }) => authService.register(name, email, password),
    onSuccess: () => {
      navigate('/login')
    },
  })

  const logout = () => {
    authService.logout()
    storeLogout()
    queryClient.clear()
    navigate('/login')
  }

  return {
    user: profile ?? user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegisterPending: registerMutation.isPending,
    logout,
  }
}
