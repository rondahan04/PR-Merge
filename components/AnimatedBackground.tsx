'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const orbs = [orb1Ref.current, orb2Ref.current, orb3Ref.current].filter(Boolean) as HTMLElement[]
    const cursor = cursorRef.current

    // normalized -0.5..0.5 for parallax
    let targetNX = 0, targetNY = 0
    let currentNX = 0, currentNY = 0

    // absolute px for cursor glow
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    let targetAX = cx, targetAY = cy
    let currentAX = cx, currentAY = cy

    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      targetNX = e.clientX / window.innerWidth - 0.5
      targetNY = e.clientY / window.innerHeight - 0.5
      targetAX = e.clientX
      targetAY = e.clientY
    }

    const tick = () => {
      const t = Date.now() * 0.001

      // parallax orbs — slow lerp
      currentNX += (targetNX - currentNX) * 0.04
      currentNY += (targetNY - currentNY) * 0.04
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 45
        const floatX = Math.sin(t * 0.22 + i * 2.094) * 40
        const floatY = Math.cos(t * 0.17 + i * 1.571) * 32
        orb.style.transform = `translate(${currentNX * depth + floatX}px, ${currentNY * depth + floatY}px)`
      })

      // cursor glow — fast lerp, centered on cursor
      currentAX += (targetAX - currentAX) * 0.1
      currentAY += (targetAY - currentAY) * 0.1
      if (cursor) {
        cursor.style.transform = `translate(${currentAX - 150}px, ${currentAY - 150}px)`
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes grid-drift {
          from { background-position: 0 0; }
          to { background-position: 0 60px; }
        }
        @keyframes orb-breathe-1 {
          0%, 100% { opacity: 0.85; filter: blur(70px); }
          50% { opacity: 1; filter: blur(55px); }
        }
        @keyframes orb-breathe-2 {
          0%, 100% { opacity: 0.75; filter: blur(70px); }
          50% { opacity: 0.95; filter: blur(50px); }
        }
        @keyframes orb-breathe-3 {
          0%, 100% { opacity: 0.65; filter: blur(60px); }
          50% { opacity: 0.9; filter: blur(45px); }
        }
      `}</style>

      {/* base */}
      <div className="absolute inset-0" style={{ background: '#050816' }} />

      {/* cursor-following glow */}
      <div
        ref={cursorRef}
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: 0,
          left: 0,
          background: 'radial-gradient(circle, rgba(180,180,255,0.18) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />

      {/* orb 1 — indigo, top-left */}
      <div
        ref={orb1Ref}
        className="absolute rounded-full"
        style={{
          width: 720,
          height: 720,
          top: -260,
          left: -210,
          background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 65%)',
          filter: 'blur(70px)',
          willChange: 'transform',
          animation: 'orb-breathe-1 9s ease-in-out infinite',
        }}
      />

      {/* orb 2 — violet, bottom-right */}
      <div
        ref={orb2Ref}
        className="absolute rounded-full"
        style={{
          width: 620,
          height: 620,
          bottom: -160,
          right: -160,
          background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 65%)',
          filter: 'blur(70px)',
          willChange: 'transform',
          animation: 'orb-breathe-2 12s ease-in-out infinite 3s',
        }}
      />

      {/* orb 3 — cyan, center-right */}
      <div
        ref={orb3Ref}
        className="absolute rounded-full"
        style={{
          width: 480,
          height: 480,
          top: '35%',
          right: -90,
          background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 65%)',
          filter: 'blur(60px)',
          willChange: 'transform',
          animation: 'orb-breathe-3 10s ease-in-out infinite 6s',
        }}
      />

      {/* perspective grid — scrolling toward viewer */}
      <div
        className="absolute bottom-0 left-[-20%] right-[-20%] h-[45%]"
        style={{ perspective: '250px', perspectiveOrigin: '50% 0%' }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.16) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.16) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'rotateX(72deg)',
            transformOrigin: 'top center',
            animation: 'grid-drift 5s linear infinite',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.9) 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.9) 60%, transparent 100%)',
          }}
        />
      </div>
    </div>
  )
}
