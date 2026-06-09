'use client'

import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { Snippet } from '@/store/gameStore'

interface Props {
  snippet: Snippet
  onSwipe: (approved: boolean) => void
  disabled?: boolean
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
  borderRadius: '16px',
}

export default function SwipeCard({ snippet, onSwipe, disabled }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const greenOpacity = useTransform(x, [0, 160], [0, 0.45])
  const redOpacity = useTransform(x, [-160, 0], [0.45, 0])
  const codeRef = useRef<HTMLElement>(null)
  const swipedRef = useRef(false)

  const prismLang = snippet.language === 'python' ? 'python' :
                    snippet.language === 'java' ? 'java' :
                    snippet.language === 'sql' ? 'sql' : 'javascript'

  const langLabel = snippet.language === 'python' ? 'Python' :
                    snippet.language === 'java' ? 'Java' :
                    snippet.language === 'sql' ? 'SQL' : 'JavaScript'

  useEffect(() => {
    if (!codeRef.current) return
    import('prismjs').then((Prism) => {
      const loadLang = () => {
        if (codeRef.current) Prism.highlightElement(codeRef.current)
      }
      if (prismLang === 'python') {
        import('prismjs/components/prism-python' as string).then(loadLang).catch(loadLang)
      } else if (prismLang === 'java') {
        import('prismjs/components/prism-java' as string).then(loadLang).catch(loadLang)
      } else if (prismLang === 'sql') {
        import('prismjs/components/prism-sql' as string).then(loadLang).catch(loadLang)
      } else {
        import('prismjs/components/prism-javascript' as string).then(loadLang).catch(loadLang)
      }
    })
  }, [snippet.snippet, prismLang])

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (disabled || swipedRef.current) return
    const threshold = 100
    if (Math.abs(info.offset.x) > threshold) {
      const approved = info.offset.x > 0
      swipedRef.current = true
      const flyX = approved ? 600 : -600
      animate(x, flyX, { duration: 0.35, ease: 'easeOut' }).then(() => {
        onSwipe(approved)
      })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
    }
  }

  return (
    <div className="relative w-full max-w-[420px] select-none" style={{ touchAction: 'none' }}>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        className="cursor-grab"
      >
        <div style={glassCard}>
          {/* green tint — swipe right */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgb(34,197,94)', opacity: greenOpacity, zIndex: 1, borderRadius: '16px' }}
          />

          {/* red tint — swipe left */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgb(239,68,68)', opacity: redOpacity, zIndex: 1, borderRadius: '16px' }}
          />

          {/* content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{langLabel}</span>
              {snippet.recycled && (
                <span className="text-xs text-white/30 font-light tracking-wide">recycled</span>
              )}
            </div>

            <div className="p-4">
              <pre className="text-sm leading-relaxed m-0" style={{ whiteSpace: 'pre', overflowX: 'auto', overflowY: 'visible' }}>
                <code ref={codeRef} className={`language-${prismLang}`}>
                  {snippet.snippet}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* swipe hints */}
      <div className="flex justify-between mt-4 px-2 text-xs text-white/25 font-light tracking-widest uppercase">
        <span>← Reject</span>
        <span>Approve →</span>
      </div>
    </div>
  )
}
