'use client'

import { useEffect, useRef } from 'react'

export function ArtalkComments() {
  const containerRef = useRef<HTMLDivElement>(null)
  const server = process.env.NEXT_PUBLIC_ARTALK_SERVER
  const site = process.env.NEXT_PUBLIC_ARTALK_SITE

  useEffect(() => {
    if (!server || !site) return

    const script = document.createElement('script')
    script.src = `${server}/dist/Artalk.js`
    script.onload = () => {
      interface ArtalkGlobal {
        init: (opts: Record<string, unknown>) => void
      }
      const Artalk = (window as unknown as Record<string, ArtalkGlobal>).Artalk
      Artalk?.init({
        el: containerRef.current!,
        server,
        site,
        pageKey: window.location.pathname,
      })
    }

    // css
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `${server}/dist/Artalk.css`
    document.head.appendChild(link)
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [server, site])

  if (!server || !site) return null

  return <div ref={containerRef} className="mt-8" />
}
