import type { VoiceState } from '@/types/voice'

export interface RecognitionCallbacks {
  onResult: (text: string, isFinal: boolean, confidence: number) => void
  onError: (error: string) => void
  onStateChange: (state: VoiceState) => void
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null
  private callbacks: RecognitionCallbacks | null = null
  private listeningMode: ListeningMode = 'continuous'
  private isActive = false
  private restartTimeout: ReturnType<typeof setTimeout> | null = null
  private lang = 'en-IN'
  private sensitivity = 0.5
  private destroyed = false

  get isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  get isListening(): boolean {
    return this.isActive
  }

  get currentLang(): string {
    return this.lang
  }

  setCallbacks(cb: RecognitionCallbacks): void {
    this.callbacks = cb
  }

  setLanguage(lang: string): void {
    this.lang = lang
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  setSensitivity(level: number): void {
    this.sensitivity = Math.max(0, Math.min(1, level))
  }

  setMode(mode: ListeningMode): void {
    this.listeningMode = mode
    if (this.recognition) {
      this.recognition.continuous = mode === 'continuous'
    }
  }

  private createRecognition(): SpeechRecognition | null {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return null

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = this.listeningMode === 'continuous'
    recognition.interimResults = true
    recognition.lang = this.lang
    recognition.maxAlternatives = 3

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const best = result[0]
        const confidenceThreshold = this.sensitivity * 0.5
        if (best.confidence >= confidenceThreshold) {
          this.callbacks?.onResult(
            best.transcript,
            result.isFinal,
            best.confidence
          )
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      if (this.destroyed) return
      this.callbacks?.onError(event.error)
      this.isActive = false
      this.callbacks?.onStateChange('error')
      if (this.listeningMode === 'continuous' && !this.destroyed) {
        this.scheduleRestart()
      }
    }

    recognition.onend = () => {
      if (this.destroyed) return
      if (this.isActive && this.listeningMode === 'continuous') {
        this.scheduleRestart()
      } else {
        this.isActive = false
        this.callbacks?.onStateChange('idle')
      }
    }

    return recognition
  }

  private scheduleRestart(): void {
    if (this.restartTimeout) clearTimeout(this.restartTimeout)
    this.restartTimeout = setTimeout(() => {
      if (this.isActive && !this.destroyed) {
        this.start()
      }
    }, 300)
  }

  start(): void {
    if (this.isActive || this.destroyed) return
    if (!this.isSupported) {
      this.callbacks?.onError('Speech recognition not supported')
      return
    }

    this.recognition = this.createRecognition()
    if (!this.recognition) return

    this.isActive = true
    this.callbacks?.onStateChange('listening')
    try {
      this.recognition.start()
    } catch {
      this.isActive = false
      this.callbacks?.onStateChange('idle')
    }
  }

  stop(): void {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }
    this.isActive = false
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch {}
      this.recognition = null
    }
    this.callbacks?.onStateChange('idle')
  }

  toggle(): void {
    if (this.isActive) this.stop()
    else this.start()
  }

  destroy(): void {
    this.destroyed = true
    this.stop()
    this.callbacks = null
  }

  reset(): void {
    this.destroyed = false
  }
}

export const speechRecognition = new SpeechRecognitionService()
