'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

export function InstagramEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Se o script do Instagram já está carregado, processa os embeds
    if (window.instgrm) {
      window.instgrm.Embeds.process()
      return
    }

    // Caso contrário, injeta o script uma vez
    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script')
      script.id = 'instagram-embed-script'
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.instgrm) window.instgrm.Embeds.process()
      }
      document.body.appendChild(script)
    }
  }, [url])

  return (
    <div ref={ref} className="w-full flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        data-instgrm-captioned
        style={{
          background: '#FFF',
          border: '0',
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '0',
          maxWidth: '100%',
          minWidth: '326px',
          padding: '0',
          width: '100%',
        }}
      >
        <div style={{ padding: '16px' }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888' }}
          >
            Ver no Instagram
          </a>
        </div>
      </blockquote>
    </div>
  )
}
