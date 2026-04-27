declare module 'dplayer' {
  interface DPlayerOptions {
    container: HTMLElement
    live?: boolean
    autoplay?: boolean
    theme?: string
    loop?: boolean
    lang?: string
    screenshot?: boolean
    hotkey?: boolean
    preload?: 'auto' | 'metadata' | 'none'
    volume?: number
    mutex?: boolean
    video?: {
      url: string
      pic?: string
      thumbnails?: string
      type?: 'auto' | 'hls' | 'flv' | 'dash' | 'webtorrent' | 'normal' | string
      customType?: Record<
        string,
        (video: HTMLVideoElement, player: unknown) => void
      >
    }
    danmaku?: {
      id: string
      api: string
      token?: string
      maximum?: number
      addition?: string[]
      user?: string
      bottom?: string
      unlimited?: boolean
      speedRate?: number
    }
    contextmenu?: Array<{
      text: string
      link?: string
      click?: () => void
    }>
  }

  interface DPlayer {
    play(): void
    pause(): void
    seek(time: number): void
    toggle(): void
    on(event: string, handler: () => void): void
    switchVideo(video: { url: string; pic?: string; type?: string }): void
    notice(text: string, time?: number, opacity?: number): void
    switchQuality(index: number): void
    destroy(): void
    speed(rate: number): void
    volume(
      percentage: number,
      nostorage?: boolean,
      nonotice?: boolean
    ): void
    danmaku: {
      send(
        data: { text: string; color?: string; type?: string },
        callback?: () => void
      ): void
      draw(danmaku: { text: string; color?: string; type?: string }): void
      opacity(percentage: number): void
      clear(): void
      hide(): void
      show(): void
    }
    fullScreen: {
      request(type?: 'web' | 'browser'): void
      cancel(): void
    }
    video: HTMLVideoElement
    container: HTMLElement
  }

  interface DPlayerConstructor {
    new (options: DPlayerOptions): DPlayer
  }

  const DPlayer: DPlayerConstructor
  export default DPlayer
}
