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

    // Load Artalk CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `${server}/dist/Artalk.css`
    document.head.appendChild(link)

    // Custom styles for Artalk
    const customStyle = document.createElement('style')
    customStyle.textContent = `
      .artalk, .atk-layer-wrap {
        --at-color-main: #3eaafa !important;
      }
      .atk-grp-switcher {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        height: 35px !important;
      }
      .atk-grp-switcher::-webkit-scrollbar {
        height: 5px;
      }
      .atk-grp-switcher::-webkit-scrollbar-track {
        background: transparent;
      }
      .atk-grp-switcher::-webkit-scrollbar-thumb {
        background-color: var(--at-color-main);
        border-radius: 3px;
      }
    `
    document.head.appendChild(customStyle)

    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [server, site])

  if (!server || !site) return null

  return <div ref={containerRef} className="mt-8" />
}
