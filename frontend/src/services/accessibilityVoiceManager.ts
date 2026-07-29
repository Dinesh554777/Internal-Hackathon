import type { DisabilityMode, VoiceAdaptation } from '@/types/voice'

export class AccessibilityVoiceManager {
  private mode: DisabilityMode = 'none'

  setMode(mode: DisabilityMode): void {
    this.mode = mode
  }

  get currentMode(): DisabilityMode {
    return this.mode
  }

  getAdaptation(): VoiceAdaptation {
    switch (this.mode) {
      case 'blind':
        return {
          speechRate: 0.85,
          verbosity: 'detailed',
          requireConfirmation: true,
          autoReadPage: true,
          describeButtons: true,
          largeText: true,
          highContrast: true,
          slowSpeech: false,
          stepByStep: false,
          captionsRequired: false,
          voiceOptional: false,
        }
      case 'motor_disability':
        return {
          speechRate: 0.9,
          verbosity: 'normal',
          requireConfirmation: false,
          autoReadPage: false,
          describeButtons: true,
          largeText: false,
          highContrast: false,
          slowSpeech: false,
          stepByStep: false,
          captionsRequired: false,
          voiceOptional: false,
        }
      case 'hearing_impairment':
        return {
          speechRate: 1.0,
          verbosity: 'minimal',
          requireConfirmation: false,
          autoReadPage: false,
          describeButtons: false,
          largeText: false,
          highContrast: false,
          slowSpeech: false,
          stepByStep: false,
          captionsRequired: true,
          voiceOptional: true,
        }
      case 'speech_disability':
        return {
          speechRate: 1.0,
          verbosity: 'minimal',
          requireConfirmation: false,
          autoReadPage: false,
          describeButtons: false,
          largeText: false,
          highContrast: false,
          slowSpeech: false,
          stepByStep: false,
          captionsRequired: true,
          voiceOptional: true,
        }
      case 'low_vision':
        return {
          speechRate: 0.9,
          verbosity: 'normal',
          requireConfirmation: false,
          autoReadPage: false,
          describeButtons: false,
          largeText: true,
          highContrast: true,
          slowSpeech: false,
          stepByStep: false,
          captionsRequired: true,
          voiceOptional: false,
        }
      case 'cognitive_disability':
        return {
          speechRate: 0.7,
          verbosity: 'minimal',
          requireConfirmation: true,
          autoReadPage: false,
          describeButtons: false,
          largeText: true,
          highContrast: false,
          slowSpeech: true,
          stepByStep: true,
          captionsRequired: true,
          voiceOptional: false,
        }
      case 'senior_citizen':
        return {
          speechRate: 0.65,
          verbosity: 'normal',
          requireConfirmation: true,
          autoReadPage: false,
          describeButtons: true,
          largeText: true,
          highContrast: true,
          slowSpeech: true,
          stepByStep: true,
          captionsRequired: true,
          voiceOptional: false,
        }
      default:
        return {
          speechRate: 0.9,
          verbosity: 'normal',
          requireConfirmation: false,
          autoReadPage: false,
          describeButtons: false,
          largeText: false,
          highContrast: false,
          slowSpeech: false,
          stepByStep: false,
          captionsRequired: false,
          voiceOptional: false,
        }
    }
  }
}

export const accessibilityVoiceManager = new AccessibilityVoiceManager()
