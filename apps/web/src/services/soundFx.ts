// Calming Synthesized Web Audio Sound Effects for SafeSpeak
// Pure Web Audio API — zero external audio assets or network downloads required

class SoundEffectsManager {
  private ctx: AudioContext | null = null
  private muted: boolean = false

  constructor() {
    this.muted = localStorage.getItem('safespeak_sound_muted') === 'true'
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('safespeak_sound_muted', String(this.muted))
    return this.muted
  }

  public isMuted(): boolean {
    return this.muted
  }

  /**
   * Soft, soothing chime when peer sends a message (432Hz calming pitch)
   */
  public playMessageReceived() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(432, now)
    osc.frequency.exponentialRampToValueAtTime(576, now + 0.15)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.35)
  }

  /**
   * Gentle affirmative tap when user sends a message
   */
  public playMessageSent() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(528, now)
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.12)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  }

  /**
   * Ambient rising bell tone for breathing guide (Inhale)
   */
  public playBreathIn() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(440, now + 3.0)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 1.5)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 3.5)
  }

  /**
   * Gentle sparkling pentatonic chime for reflection closure reactions
   */
  public playReactionSparkle() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    const freqs = [528, 660, 792, 1056]
    freqs.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.08
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx!.destination)

      osc.start(now)
      osc.stop(now + 0.4)
    })
  }
}

export const soundFx = new SoundEffectsManager()
