import { useGameStore } from '@/store/gameStore'

export function ShareLife() {
  const players = useGameStore((s) => s.players)
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)

  if (players.length < 2) return null

  const activePlayer = players[activePlayerIndex]
  const partnerIndex = activePlayerIndex === 0 ? 1 : 0
  const canShare = activePlayer.lives > 1

  const handleShare = () => {
    if (!canShare) return
    useGameStore.setState((state) => {
      const newPlayers = [...state.players]
      newPlayers[activePlayerIndex] = { ...newPlayers[activePlayerIndex], lives: newPlayers[activePlayerIndex].lives - 1 }
      newPlayers[partnerIndex] = { ...newPlayers[partnerIndex], lives: newPlayers[partnerIndex].lives + 1 }
      return { players: newPlayers }
    })
  }

  return (
    <button
      onClick={handleShare}
      disabled={!canShare}
      title={canShare ? 'Ein Leben an Partner senden' : 'Du brauchst mind. 2 Leben'}
      style={{
        position: 'absolute', top: '3.5rem', right: '1rem',
        padding: '0.5rem 1rem',
        background: canShare ? '#dc2626' : '#374151',
        color: 'white', border: 'none', borderRadius: '8px',
        cursor: canShare ? 'pointer' : 'default',
        opacity: canShare ? 1 : 0.5, fontSize: '0.9rem',
      }}
    >
      ❤️ → Partner
    </button>
  )
}
