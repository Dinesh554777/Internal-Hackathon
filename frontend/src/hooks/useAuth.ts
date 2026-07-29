import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      try {
        const user = await authService.getProfile()
        setUser(user)
        return user
      } catch {
        storeLogout()
        return null
      }
    },
    enabled: isAuthenticated,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      storeLogin(data.user, data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
      navigate('/', { replace: true })
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
      role,
    }: {
      name: string
      email: string
      password: string
      role?: string
    }) => authService.register(name, email, password, role),
    onSuccess: (_data, variables) => {
      authService.login(variables.email, variables.password).then((res) => {
        storeLogin(res.user, res.access_token, res.refresh_token)
        queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
        navigate('/', { replace: true })
      })
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      authService.forgotPassword(email),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  })

  const logout = () => {
    authService.logout().catch(() => {})
    storeLogout()
    queryClient.clear()
    navigate('/login', { replace: true })
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
    forgotPassword: forgotPasswordMutation.mutate,
    forgotPasswordError: forgotPasswordMutation.error,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    forgotPasswordSuccess: forgotPasswordMutation.isSuccess,
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordError: resetPasswordMutation.error,
    isResetPasswordPending: resetPasswordMutation.isPending,
    resetPasswordSuccess: resetPasswordMutation.isSuccess,
    logout,
  }
}
