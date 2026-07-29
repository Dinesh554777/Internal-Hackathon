import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import type { Order } from '@/types'
import { useAuthStore } from '@/store/authStore'

export function useOrders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Order[] }>('/orders')
      return data.data
    },
    enabled: isAuthenticated,
  })
}

export function useOrder(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Order }>(`/orders/${id}`)
      return data.data
    },
    enabled: isAuthenticated && !!id,
  })
}
