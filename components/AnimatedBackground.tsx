'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)

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
        mouseControls: false,
        touchControls: false,
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
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10" aria-hidden="true" />
  )
}
