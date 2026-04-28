'use client'

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  mediaUrl: string
  mediaType: string
  isM3U8: boolean
  coverUrl: string | null
}

export function VideoPlayer({ mediaUrl, mediaType, isM3U8, coverUrl }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dpRef = useRef<{ destroy?: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const DPlayerModule = await import('dplayer')
      const DPlayer = DPlayerModule.default
      if (cancelled || !containerRef.current) return

      const options = {
        container: containerRef.current,
        autoplay: false,
        video: {
          url: mediaUrl,
        } as Record<string, unknown>,
      } as Record<string, unknown>

      if (coverUrl) {
        ;(options.video as Record<string, unknown>).pic = coverUrl
      }

      if (isM3U8) {
        const Hls = (await import('hls.js')).default
        ;(options.video as Record<string, unknown>).type = 'customHls'
        ;(options.video as Record<string, unknown>).customType = {
          customHls(video: HTMLVideoElement) {
            const hls = new Hls({
              startPosition: 0,
            })
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.currentTime = 0

              const details = hls.levels[0]?.details
              if (details && details.live && details.fragments.length > 0) {
                const lastFrag = details.fragments[details.fragments.length - 1]
                const endTime = lastFrag.start + lastFrag.duration - 0.5

                const checkEnd = () => {
                  if (video.currentTime >= endTime) {
                    video.removeEventListener('timeupdate', checkEnd)
                    video.dispatchEvent(new Event('ended'))
                  }
                }
                video.addEventListener('timeupdate', checkEnd)
              }
            })
            hls.loadSource(video.src)
            hls.attachMedia(video)
          },
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dpRef.current = new DPlayer(options as any)
    }

    init()

    return () => {
      cancelled = true
      dpRef.current?.destroy?.()
    }
  }, [mediaUrl, isM3U8, coverUrl])

  return (
    <div
      ref={containerRef}
      className={mediaType === 'audio' ? 'h-16' : 'w-full aspect-video rounded-lg overflow-hidden bg-black'}
    />
  )
}
