import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { CharacterType } from '@/types/game'
import { hasSaveGame, loadGame } from '@/save/saveManager'

interface MainMenuProps {
  onCoopClick?: () => void
}

export function MainMenu({ onCoopClick }: MainMenuProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('human')
  const startGame = useGameStore((s) => s.startGame)

  const handleLoad = () => {
    const save = loadGame()
    if (save) {
      startGame(save.character as CharacterType)
      useGameStore.setState({
        currentLevel: save.currentLevel,
        unlockedLevels: save.unlockedLevels,
        players: useGameStore.getState().players.map(p => ({
          ...p,
          equipment: save.equipment,
          equippedItems: save.equippedItems as any,
        })),
      })
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
      color: 'white',
    }}>
      <h1 style={{
        fontSize: '3rem', marginBottom: '0.5rem',
        textShadow: '0 0 20px #7c3aed, 0 0 40px #5b21b6',
      }}>
        Noés Abenteuer
      </h1>
      <p style={{ color: '#a78bfa', marginBottom: '3rem', fontSize: '1.2rem' }}>
        Ein magisches Brettspiel
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Wähle deine Figur:</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setSelectedCharacter('human')}
            style={{
              padding: '1rem 2rem', fontSize: '1.2rem',
              background: selectedCharacter === 'human' ? '#7c3aed' : '#374151',
              color: 'white',
              border: selectedCharacter === 'human' ? '2px solid #a78bfa' : '2px solid transparent',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >🧙 Mensch</button>
          <button
            onClick={() => setSelectedCharacter('tiger')}
            style={{
              padding: '1rem 2rem', fontSize: '1.2rem',
              background: selectedCharacter === 'tiger' ? '#d97706' : '#374151',
              color: 'white',
              border: selectedCharacter === 'tiger' ? '2px solid #fbbf24' : '2px solid transparent',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >🐯 Tiger</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
        <button
          onClick={() => startGame(selectedCharacter)}
          style={{
            padding: '1rem 3rem', fontSize: '1.3rem',
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: 'white', border: 'none', borderRadius: '12px',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
          }}
        >Neues Spiel</button>

        {hasSaveGame() && (
          <button
            onClick={handleLoad}
            style={{
              padding: '0.8rem 2rem', fontSize: '1.1rem',
              background: '#374151', color: 'white',
              border: '1px solid #4b5563', borderRadius: '8px', cursor: 'pointer',
            }}
          >Spiel laden</button>
        )}

        {onCoopClick && (
          <button
            onClick={onCoopClick}
            style={{
              padding: '0.8rem 2rem', fontSize: '1.1rem',
              background: '#059669', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}
          >🤝 Koop (LAN)</button>
        )}
      </div>
    </div>
  )
}
