import { useGameStore } from '@/store/gameStore'
import { level1 } from '@/data/levels/level1'

export function HUD() {
  const players = useGameStore((s) => s.players)
  const currentLevel = useGameStore((s) => s.currentLevel)
  const player = players[0]

  if (!player) return null

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.5rem' }}>
          {Array.from({ length: player.lives }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
          {Array.from({ length: 2 - player.lives }).map((_, i) => (
            <span key={`empty-${i}`} style={{ opacity: 0.3 }}>🖤</span>
          ))}
        </div>
        <div style={{
          color: 'white',
          fontSize: '1.1rem',
          background: 'rgba(0,0,0,0.5)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
        }}>
          Level {currentLevel} — {level1.name}
        </div>
      </div>
    </div>
  )
}
