import { useState, useEffect, useRef } from 'react'
import { getGreenZone, calculateReactionClick } from '@/game/combat'

interface ReactionClickProps {
  level: number
  isBoss: boolean
  amuletBonus: number
  onResult: (won: boolean) => void
}

export function ReactionClick({ level, isBoss, amuletBonus, onResult }: ReactionClickProps) {
  const [progress, setProgress] = useState(0)
  const [clicked, setClicked] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const animRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const duration = 2000
  const { start: greenStart, end: greenEnd } = getGreenZone(level, isBoss)

  useEffect(() => {
    startRef.current = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p < 1 && !clicked) {
        animRef.current = requestAnimationFrame(animate)
      } else if (p >= 1 && !clicked) {
        setClicked(true)
        setResult(false)
        setTimeout(() => onResult(false), 1000)
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  const handleClick = () => {
    if (clicked) return
    setClicked(true)
    const { won } = calculateReactionClick(progress, greenStart, greenEnd, amuletBonus)
    setResult(won)
    setTimeout(() => onResult(won), 1000)
  }

  const adjustedStart = Math.max(0, greenStart - amuletBonus * 0.05)
  const adjustedEnd = Math.min(1, greenEnd + amuletBonus * 0.05)

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem', color: '#10b981' }}>🎯 Reaktions-Klick!</h2>
      <p style={{ marginBottom: '1.5rem' }}>Klicke im grünen Bereich!</p>
      <div style={{ width: '100%', height: '40px', background: '#374151', borderRadius: '8px', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', left: `${adjustedStart * 100}%`, width: `${(adjustedEnd - adjustedStart) * 100}%`, height: '100%', background: 'rgba(16, 185, 129, 0.4)' }} />
        <div style={{ position: 'absolute', left: `${progress * 100}%`, width: '4px', height: '100%', background: clicked ? (result ? '#10b981' : '#ef4444') : '#ffffff', transition: 'background 0.2s' }} />
      </div>
      <button onClick={handleClick} disabled={clicked} style={{ width: '120px', height: '120px', borderRadius: '50%', background: clicked ? '#374151' : 'radial-gradient(circle, #10b981, #065f46)', border: 'none', fontSize: '2rem', color: 'white', cursor: clicked ? 'default' : 'pointer', boxShadow: clicked ? 'none' : '0 0 30px rgba(16, 185, 129, 0.5)' }}>
        {clicked ? (result ? '✅' : '❌') : '🎯'}
      </button>
      {result !== null && (
        <p style={{ marginTop: '1rem', fontSize: '1.3rem', color: result ? '#10b981' : '#ef4444' }}>
          {result ? '🎉 Perfektes Timing!' : '💀 Daneben!'}
        </p>
      )}
    </div>
  )
}
