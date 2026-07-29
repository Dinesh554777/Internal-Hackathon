import api from './api'

export interface VoiceProcessRequest {
  text: string
  conversation_id?: string
  context?: string
}

export interface VoiceProcessResponse {
  intent: string
  confidence: number
  response: string
  action: string | null
  data: Record<string, unknown> | Array<unknown> | null
}

export const voiceService = {
  async process(payload: VoiceProcessRequest): Promise<VoiceProcessResponse> {
    const { data } = await api.post<VoiceProcessResponse>(
      '/voice/process',
      payload
    )
    return data
  },

  async clear(conversation_id: string): Promise<void> {
    await api.post('/voice/clear', null, { params: { conversation_id } })
  },
}
