'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    let mounted = true

    Promise.all([
      import('three'),
      import('vanta/dist/vanta.net.min' as string),
    ]).then(([THREE]) => {
      if (!mounted || !containerRef.current || !(window as any).VANTA) return
      vantaRef.current = (window as any).VANTA.NET({
        el: containerRef.current,
        THREE,
        mouseControls: isHome,
        touchControls: isHome,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
      })
    }).catch(() => {/* vanta failed — page still works */})

    return () => {
      mounted = false
      vantaRef.current?.destroy()
      vantaRef.current = null
    }
  }, [isHome])

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10" aria-hidden="true" />
  )
}
