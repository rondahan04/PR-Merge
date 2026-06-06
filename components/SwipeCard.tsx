'use client'

import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { Snippet } from '@/store/gameStore'

interface Props {
  snippet: Snippet
  onSwipe: (approved: boolean) => void
  disabled?: boolean
}

export default function SwipeCard({ snippet, onSwipe, disabled }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const approveOpacity = useTransform(x, [20, 120], [0, 1])
  const rejectOpacity = useTransform(x, [-120, -20], [1, 0])
  const codeRef = useRef<HTMLElement>(null)
  const swipedRef = useRef(false)

  useEffect(() => {
    if (!codeRef.current) return
    import('prismjs').then((Prism) => {
      // load the language
      const lang = snippet.language === 'javascript' ? 'javascript' :
                   snippet.language === 'python' ? 'python' : 'sql'
      const loadLang = () => {
        if (codeRef.current) {
          Prism.highlightElement(codeRef.current)
        }
      }
      if (lang === 'javascript') {
        import('prismjs/components/prism-javascript' as string).then(loadLang).catch(loadLang)
      } else if (lang === 'python') {
        import('prismjs/components/prism-python' as string).then(loadLang).catch(loadLang)
      } else {
        import('prismjs/components/prism-sql' as string).then(loadLang).catch(loadLang)
      }
    })
  }, [snippet.snippet, snippet.language])

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

  const langLabel = snippet.language === 'javascript' ? 'JavaScript' :
                    snippet.language === 'python' ? 'Python' : 'SQL'

  return (
    <div className="relative w-[340px] select-none" style={{ touchAction: 'none' }}>
      {/* approve label */}
      <motion.div
        style={{ opacity: approveOpacity }}
        className="absolute top-6 left-6 z-10 rotate-[-12deg] border-4 border-green-400 text-green-400 font-black text-2xl px-3 py-1 rounded-lg pointer-events-none"
      >
        APPROVE
      </motion.div>

      {/* reject label */}
      <motion.div
        style={{ opacity: rejectOpacity }}
        className="absolute top-6 right-6 z-10 rotate-[12deg] border-4 border-red-400 text-red-400 font-black text-2xl px-3 py-1 rounded-lg pointer-events-none"
      >
        REJECT
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{
          x,
          rotate,
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
        className="cursor-grab rounded-2xl overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-xs font-mono text-white/50 uppercase tracking-widest">{langLabel}</span>
          {snippet.recycled && (
            <span className="text-xs text-white/40">♻ recycled</span>
          )}
        </div>

        {/* code */}
        <div className="overflow-auto max-h-64 p-4">
          <pre className="text-sm leading-relaxed m-0">
            <code
              ref={codeRef}
              className={`language-${snippet.language === 'javascript' ? 'javascript' : snippet.language === 'python' ? 'python' : 'sql'}`}
            >
              {snippet.snippet}
            </code>
          </pre>
        </div>
      </motion.div>

      {/* swipe hints */}
      <div className="flex justify-between mt-4 px-2 text-xs text-white/30">
        <span>← REJECT</span>
        <span>APPROVE →</span>
      </div>
    </div>
  )
}
