import { useGameStore } from '@/store/gameStore'

export function CoopHUD() {
  const players = useGameStore((s) => s.players)
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)

  if (players.length < 2) return null

  const partner = players[activePlayerIndex === 0 ? 1 : 0]
  const active = players[activePlayerIndex]

  const getFieldNumber = (tileId: string): number => {
    const num = parseInt(tileId.replace(/\D/g, ''))
    return isNaN(num) ? 0 : num
  }

  const distance = Math.abs(getFieldNumber(active.currentTileId) - getFieldNumber(partner.currentTileId))
  const canHelp = distance <= 3

  return (
    <div style={{
      position: 'absolute', top: '3.5rem', left: '1rem',
      background: 'rgba(0,0,0,0.6)', padding: '0.7rem 1rem',
      borderRadius: '8px', color: 'white', fontSize: '0.9rem',
    }}>
      <div style={{ marginBottom: '0.3rem', color: '#a78bfa' }}>
        Partner ({partner.character === 'human' ? '🧙' : '🐯'})
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
        {Array.from({ length: partner.lives }).map((_, i) => <span key={i}>❤️</span>)}
        {Array.from({ length: Math.max(0, 2 - partner.lives) }).map((_, i) => <span key={`e-${i}`} style={{ opacity: 0.3 }}>🖤</span>)}
      </div>
      <div style={{ color: canHelp ? '#10b981' : '#6b7280' }}>
        Abstand: {distance} Felder {canHelp ? '(kann helfen!)' : ''}
      </div>
    </div>
  )
}
