import { useState, useEffect, useCallback } from 'react'
import { getClickThreshold, getClickDuration, calculateClickBattle } from '@/game/combat'

interface ClickBattleProps {
  level: number
  isBoss: boolean
  glovesBonus: number
  onResult: (won: boolean) => void
}

export function ClickBattle({ level, isBoss, glovesBonus, onResult }: ClickBattleProps) {
  const threshold = getClickThreshold(level, isBoss)
  const duration = getClickDuration(level, isBoss)
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (finished) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) {
          clearInterval(interval)
          setFinished(true)
          return 0
        }
        return t - 100
      })
    }, 100)
    return () => clearInterval(interval)
  }, [finished])

  useEffect(() => {
    if (finished) {
      const effectiveClicks = clicks * (1 + glovesBonus * 0.5)
      const { won } = calculateClickBattle(effectiveClicks, threshold)
      setTimeout(() => onResult(won), 1000)
    }
  }, [finished])

  const handleClick = useCallback(() => {
    if (!finished) setClicks((c) => c + 1)
  }, [finished])

  const progress = Math.min(clicks / threshold, 1)

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem', color: '#fbbf24' }}>⚡ Schnelles Klicken!</h2>
      <p style={{ marginBottom: '0.5rem' }}>Klicke so oft du kannst!</p>
      <div style={{ margin: '1rem 0', fontSize: '1.2rem' }}>⏱️ {(timeLeft / 1000).toFixed(1)}s</div>
      <div style={{ width: '100%', height: '20px', background: '#374151', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: progress >= 1 ? '#10b981' : '#f59e0b', transition: 'width 0.1s' }} />
      </div>
      <div
        onClick={handleClick}
        style={{
          width: '150px', height: '150px', margin: '0 auto',
          background: finished ? '#374151' : 'radial-gradient(circle, #ef4444, #991b1b)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', cursor: finished ? 'default' : 'pointer', userSelect: 'none',
          boxShadow: finished ? 'none' : '0 0 30px rgba(239, 68, 68, 0.5)',
        }}
      >
        {finished ? (progress >= 1 ? '✅' : '❌') : `${clicks}`}
      </div>
      <p style={{ marginTop: '1rem', opacity: 0.7 }}>
        {threshold - clicks > 0 ? `Noch ${Math.ceil(threshold - clicks)} Klicks nötig` : 'Geschafft!'}
      </p>
    </div>
  )
}
