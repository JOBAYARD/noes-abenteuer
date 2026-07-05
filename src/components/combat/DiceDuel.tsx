import { useState } from 'react'
import { rollD10 } from '@/game/dice'
import { calculateDiceDuel, getEnemyDiceBonus } from '@/game/combat'

interface DiceDuelProps {
  level: number
  isBoss: boolean
  weaponBonus: number
  onResult: (won: boolean) => void
}

export function DiceDuel({ level, isBoss, weaponBonus, onResult }: DiceDuelProps) {
  const [playerRoll, setPlayerRoll] = useState<number | null>(null)
  const [enemyRoll, setEnemyRoll] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)

  const handleRoll = () => {
    if (rolling || result !== null) return
    setRolling(true)
    setTimeout(() => {
      const pRoll = rollD10()
      const eBonus = getEnemyDiceBonus(level, isBoss)
      const eRoll = rollD10() + eBonus
      setPlayerRoll(pRoll)
      setEnemyRoll(eRoll)
      setRolling(false)
      const { won } = calculateDiceDuel(pRoll, eRoll, weaponBonus)
      if (pRoll + weaponBonus === eRoll) {
        setTimeout(() => { setPlayerRoll(null); setEnemyRoll(null); setResult(null) }, 1500)
      } else {
        setResult(won)
        setTimeout(() => onResult(won), 1500)
      }
    }, 1000)
  }

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem', color: '#60a5fa' }}>🎲 Würfel-Duell!</h2>
      <p style={{ marginBottom: '1.5rem' }}>Wer höher würfelt, gewinnt!</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2rem' }}>
        <div>
          <p style={{ marginBottom: '0.5rem' }}>Du {weaponBonus > 0 ? `(+${weaponBonus})` : ''}</p>
          <div style={{ width: '80px', height: '80px', background: '#7c3aed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {rolling ? '?' : (playerRoll !== null ? playerRoll + weaponBonus : '—')}
          </div>
        </div>
        <div style={{ alignSelf: 'center', fontSize: '2rem' }}>⚔️</div>
        <div>
          <p style={{ marginBottom: '0.5rem' }}>Gegner</p>
          <div style={{ width: '80px', height: '80px', background: '#991b1b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {rolling ? '?' : (enemyRoll ?? '—')}
          </div>
        </div>
      </div>
      {result === null && (
        <button onClick={handleRoll} disabled={rolling} style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', background: rolling ? '#374151' : 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white', border: 'none', borderRadius: '8px', cursor: rolling ? 'default' : 'pointer' }}>
          {rolling ? 'Würfeln...' : 'Würfeln!'}
        </button>
      )}
      {result !== null && (
        <p style={{ fontSize: '1.5rem', color: result ? '#10b981' : '#ef4444' }}>
          {result ? '🎉 Gewonnen!' : '💀 Verloren!'}
        </p>
      )}
    </div>
  )
}
