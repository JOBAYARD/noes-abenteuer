import { Howl, Howler } from 'howler'
import { MUSIC_TRACKS, SFX } from './tracks'

class AudioManager {
  private music: Howl | null = null
  private currentMusicKey: string | null = null
  private sfxCache: Map<string, Howl> = new Map()
  private muted = false

  playMusic(key: string) {
    if (key === this.currentMusicKey) return
    const track = MUSIC_TRACKS[key]
    if (!track) return
    this.stopMusic()
    this.currentMusicKey = key
    this.music = new Howl({ src: [track.src], loop: track.loop, volume: track.volume })
    this.music.play()
  }

  stopMusic() {
    if (this.music) {
      this.music.fade(this.music.volume(), 0, 500)
      const m = this.music
      setTimeout(() => { m.stop() }, 500)
    }
    this.music = null
    this.currentMusicKey = null
  }

  playSfx(key: string) {
    const track = SFX[key]
    if (!track) return
    let howl = this.sfxCache.get(key)
    if (!howl) {
      howl = new Howl({ src: [track.src], volume: track.volume })
      this.sfxCache.set(key, howl)
    }
    howl.play()
  }

  toggleMute() {
    this.muted = !this.muted
    Howler.mute(this.muted)
    return this.muted
  }

  get isMuted() { return this.muted }
}

export const audioManager = new AudioManager()
