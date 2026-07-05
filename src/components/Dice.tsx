import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export function Dice() {
  const [rolling, setRolling] = useState(false)
  const rollDice = useGameStore((s) => s.rollDice)
  const diceResult = useGameStore((s) => s.diceResult)
  const phase = useGameStore((s) => s.phase)
  const waitingUntil = useGameStore((s) => s.waitingUntil)

  const isWaiting = waitingUntil !== null && Date.now() < waitingUntil
  const canRoll = phase === 'playing' && !rolling && diceResult === null && !isWaiting

  const handleRoll = () => {
    if (!canRoll) return
    setRolling(true)
    setTimeout(() => {
      rollDice()
      setRolling(false)
    }, 800)
  }

  return (
    <div
      onClick={handleRoll}
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '80px',
        background: canRoll ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#374151',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canRoll ? 'pointer' : 'default',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
        boxShadow: canRoll ? '0 0 20px rgba(124, 58, 237, 0.5)' : 'none',
        transition: 'all 0.2s',
        userSelect: 'none',
        animation: rolling ? 'shake 0.1s infinite' : 'none',
      }}
    >
      {rolling ? '?' : (diceResult ?? '🎲')}
    </div>
  )
}
