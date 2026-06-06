'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Props {
  duration: number
  running: boolean
  onExpire: () => void
  onTick?: (secondsRemaining: number) => void
}

const SIZE = 80
const STROKE = 6
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R

export default function Timer({ duration, running, onExpire, onTick }: Props) {
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const expiredRef = useRef(false)
  const svgRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<SVGTextElement>(null)

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!running) {
      stop()
      startTimeRef.current = null
      expiredRef.current = false
      if (svgRef.current) svgRef.current.style.strokeDashoffset = '0'
      if (textRef.current) textRef.current.textContent = String(duration)
      return
    }

    expiredRef.current = false
    startTimeRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = (now - (startTimeRef.current ?? now)) / 1000
      const remaining = Math.max(0, duration - elapsed)
      const secondsInt = Math.ceil(remaining)

      const progress = remaining / duration
      const dashOffset = CIRCUMFERENCE * (1 - progress)

      if (svgRef.current) {
        svgRef.current.style.strokeDashoffset = String(dashOffset)
        // pulse red in last 3 seconds
        const urgent = remaining <= 3 && remaining > 0
        svgRef.current.style.stroke = urgent ? '#ef4444' : '#22c55e'
      }
      if (textRef.current) {
        textRef.current.textContent = String(secondsInt)
        textRef.current.style.fill = remaining <= 3 ? '#ef4444' : 'white'
      }

      onTick?.(remaining)

      if (remaining <= 0) {
        if (!expiredRef.current) {
          expiredRef.current = true
          onExpire()
        }
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return stop
  }, [running, duration, onExpire, onTick, stop])

  return (
    <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
      {/* background ring */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={STROKE}
      />
      {/* progress ring */}
      <circle
        ref={svgRef}
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        stroke="#22c55e"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={0}
        style={{ transition: 'stroke 0.3s' }}
      />
      {/* text — counter-rotate so it reads upright */}
      <text
        ref={textRef}
        x={SIZE / 2}
        y={SIZE / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontWeight="bold"
        fill="white"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${SIZE / 2}px ${SIZE / 2}px` }}
      >
        {duration}
      </text>
    </svg>
  )
}
