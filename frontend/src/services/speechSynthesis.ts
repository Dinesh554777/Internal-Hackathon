export interface SynthesisCallbacks {
  onStart: () => void
  onEnd: () => void
  onPause: () => void
  onResume: () => void
  onBoundary: (text: string) => void
}

export class SpeechSynthesisService {
  private callbacks: SynthesisCallbacks | null = null
  private lastText = ''
  private _rate = 0.9
  private _pitch = 1.0
  private _volume = 1.0
  private _voice: SpeechSynthesisVoice | null = null
  private _paused = false

  get isSupported(): boolean {
    return !!window.speechSynthesis
  }

  get isSpeaking(): boolean {
    return window.speechSynthesis?.speaking ?? false
  }

  get isPaused(): boolean {
    return this._paused
  }

  get rate(): number {
    return this._rate
  }

  set rate(val: number) {
    this._rate = Math.max(0.1, Math.min(10, val))
  }

  get pitch(): number {
    return this._pitch
  }

  set pitch(val: number) {
    this._pitch = Math.max(0, Math.min(2, val))
  }

  get volume(): number {
    return this._volume
  }

  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val))
  }

  get voice(): SpeechSynthesisVoice | null {
    return this._voice
  }

  set voice(v: SpeechSynthesisVoice | null) {
    this._voice = v
  }

  getVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis?.getVoices() ?? []
  }

  getMaleVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter((v) => v.name.toLowerCase().includes('male'))
  }

  getFemaleVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter((v) =>
      v.name.toLowerCase().includes('female')
    )
  }

  setCallbacks(cb: SynthesisCallbacks): void {
    this.callbacks = cb
  }

  speak(text: string): void {
    if (!this.isSupported || !text) return
    this.cancel()

    this.lastText = text
    this._paused = false

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this._rate
    utterance.pitch = this._pitch
    utterance.volume = this._volume
    if (this._voice) utterance.voice = this._voice

    utterance.onstart = () => this.callbacks?.onStart()
    utterance.onend = () => {
      this._paused = false
      this.callbacks?.onEnd()
    }
    utterance.onpause = () => {
      this._paused = true
      this.callbacks?.onPause()
    }
    utterance.onresume = () => {
      this._paused = false
      this.callbacks?.onResume()
    }
    utterance.onboundary = () => this.callbacks?.onBoundary(text)

    window.speechSynthesis.speak(utterance)
  }

  pause(): void {
    if (this.isSpeaking && !this._paused) {
      window.speechSynthesis.pause()
    }
  }

  resume(): void {
    if (this._paused) {
      window.speechSynthesis.resume()
    }
  }

  cancel(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    this._paused = false
  }

  repeat(): void {
    if (this.lastText) {
      this.speak(this.lastText)
    }
  }

  destroy(): void {
    this.cancel()
    this.callbacks = null
  }
}

export const speechSynthesis = new SpeechSynthesisService()
