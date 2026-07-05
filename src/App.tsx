import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { MainMenu } from '@/components/MainMenu'
import { GameScene } from '@/world/GameScene'
import { HUD } from '@/components/HUD'
import { Dice } from '@/components/Dice'
import { DirectionChoice } from '@/components/DirectionChoice'
import { getReachableTiles } from '@/game/movement'
import { getTileEffect } from '@/game/tileEffects'
import { level1 } from '@/data/levels/level1'

export function App() {
  const phase = useGameStore((s) => s.phase)
  const diceResult = useGameStore((s) => s.diceResult)
  const players = useGameStore((s) => s.players)
  const movePlayer = useGameStore((s) => s.movePlayer)
  const setWaiting = useGameStore((s) => s.setWaiting)
  const loseLife = useGameStore((s) => s.loseLife)
  const completeLevel = useGameStore((s) => s.completeLevel)

  const [pendingChoices, setPendingChoices] = useState<string[] | null>(null)

  const player = players[0]

  useEffect(() => {
    if (diceResult === null || !player || pendingChoices) return

    const reachable = getReachableTiles(level1.tiles, player.currentTileId, diceResult)

    if (reachable.length === 1) {
      const targetId = reachable[0]
      movePlayer(0, targetId)

      const tile = level1.tiles.find(t => t.id === targetId)
      if (tile) {
        const effect = getTileEffect(tile.type)
        switch (effect.type) {
          case 'wait':
            setWaiting(Date.now() + effect.duration)
            break
          case 'advance': {
            const next = getReachableTiles(level1.tiles, targetId, effect.steps)
            if (next.length === 1) movePlayer(0, next[0])
            else setPendingChoices(next)
            break
          }
          case 'combat':
            if (effect.isBoss) {
              completeLevel()
            } else {
              loseLife(0)
            }
            break
          case 'loot':
            break
        }
      }
    } else if (reachable.length > 1) {
      setPendingChoices(reachable)
    }
  }, [diceResult])

  const handleChoice = (tileId: string) => {
    movePlayer(0, tileId)
    setPendingChoices(null)
  }

  if (phase === 'menu') {
    return <MainMenu />
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GameScene />
      <HUD />
      <Dice />
      {pendingChoices && (
        <DirectionChoice choices={pendingChoices} onChoose={handleChoice} />
      )}
      {phase === 'result' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '2rem 3rem',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Level geschafft! 🎉</h2>
          <p>Du hast den Endgegner besiegt!</p>
        </div>
      )}
    </div>
  )
}
