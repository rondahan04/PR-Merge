'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    let mounted = true

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js'))
      .then(() => {
        if (!mounted || !containerRef.current || !(window as any).VANTA) return
        vantaRef.current = (window as any).VANTA.NET({
          el: containerRef.current,
          mouseControls: isHome,
          touchControls: isHome,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
        })
      })
      .catch(() => {/* CDN failed — render nothing, page still works */})

    return () => {
      mounted = false
      if (vantaRef.current && typeof (vantaRef.current as any).destroy === 'function') {
        ;(vantaRef.current as any).destroy()
        vantaRef.current = null
      }
    }
  }, [isHome])

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10" aria-hidden="true" />
  )
}
