import api from './api'

export interface ImageDescriptionResponse {
  description: string
  source: string
}

export const imageDescriptionService = {
  async getDescription(productId: string): Promise<ImageDescriptionResponse> {
    const { data } = await api.get<ImageDescriptionResponse>(
      `/products/${productId}/description`
    )
    return data
  },
}
