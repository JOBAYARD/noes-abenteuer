import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { MainMenu } from '@/components/MainMenu'
import { LobbyScreen } from '@/components/LobbyScreen'
import { GameScene } from '@/world/GameScene'
import { HUD } from '@/components/HUD'
import { Dice } from '@/components/Dice'
import { DirectionChoice } from '@/components/DirectionChoice'
import { Inventory } from '@/components/Inventory'
import { CombatOverlay } from '@/components/combat/CombatOverlay'
import { LootPopup } from '@/components/LootPopup'
import { CoopHUD } from '@/components/CoopHUD'
import { ShareLife } from '@/components/ShareLife'
import { getReachableTiles } from '@/game/movement'
import { getTileEffect } from '@/game/tileEffects'
import { generateLoot, shouldDropLoot } from '@/game/loot'
import { getLevel } from '@/data/levels'
import { audioManager } from '@/audio/audioManager'
import { saveGame } from '@/save/saveManager'
import { Equipment } from '@/types/game'

export function App() {
  const phase = useGameStore((s) => s.phase)
  const diceResult = useGameStore((s) => s.diceResult)
  const players = useGameStore((s) => s.players)
  const currentLevel = useGameStore((s) => s.currentLevel)
  const unlockedLevels = useGameStore((s) => s.unlockedLevels)
  const movePlayer = useGameStore((s) => s.movePlayer)
  const setWaiting = useGameStore((s) => s.setWaiting)
  const loseLife = useGameStore((s) => s.loseLife)
  const completeLevel = useGameStore((s) => s.completeLevel)
  const addEquipment = useGameStore((s) => s.addEquipment)
  const equipItem = useGameStore((s) => s.equipItem)

  const [pendingChoices, setPendingChoices] = useState<string[] | null>(null)
  const [combatActive, setCombatActive] = useState<{ isBoss: boolean } | null>(null)
  const [lootItem, setLootItem] = useState<Equipment | null>(null)
  const [showLobby, setShowLobby] = useState(false)

  const player = players[0]
  const level = currentLevel > 0 && currentLevel <= 10 ? getLevel(currentLevel) : null

  // Audio: play music based on phase
  useEffect(() => {
    if (phase === 'menu') {
      audioManager.playMusic('menu')
    } else if (phase === 'playing' && level) {
      audioManager.playMusic(level.theme)
    } else if (phase === 'combat') {
      audioManager.playMusic('combat')
    }
  }, [phase, currentLevel])

  const handleTileEffect = (tileId: string) => {
    if (!level) return
    const tile = level.tiles.find(t => t.id === tileId)
    if (!tile) return

    const effect = getTileEffect(tile.type)
    switch (effect.type) {
      case 'wait':
        audioManager.playSfx('snail')
        setWaiting(Date.now() + effect.duration)
        break
      case 'advance': {
        audioManager.playSfx('rocket')
        const next = getReachableTiles(level.tiles, tileId, effect.steps)
        if (next.length === 1) {
          movePlayer(0, next[0])
          handleTileEffect(next[0])
        } else if (next.length > 1) {
          setPendingChoices(next)
        }
        break
      }
      case 'combat':
        setCombatActive({ isBoss: effect.isBoss })
        break
      case 'loot': {
        audioManager.playSfx('loot')
        const item = generateLoot(currentLevel)
        setLootItem(item)
        break
      }
    }
  }

  useEffect(() => {
    if (diceResult === null || !player || pendingChoices || combatActive || lootItem || !level) return

    audioManager.playSfx('dice_roll')
    const reachable = getReachableTiles(level.tiles, player.currentTileId, diceResult)

    if (reachable.length === 1) {
      movePlayer(0, reachable[0])
      handleTileEffect(reachable[0])
    } else if (reachable.length > 1) {
      setPendingChoices(reachable)
    }
  }, [diceResult])

  const handleChoice = (tileId: string) => {
    movePlayer(0, tileId)
    setPendingChoices(null)
    handleTileEffect(tileId)
  }

  const handleCombatEnd = (won: boolean) => {
    const isBoss = combatActive?.isBoss ?? false
    setCombatActive(null)

    if (won) {
      audioManager.playSfx('victory')
      if (isBoss) {
        audioManager.playSfx('level_complete')
        completeLevel()
        // Auto-save
        if (player) {
          saveGame({
            currentLevel: currentLevel + 1,
            unlockedLevels: [...unlockedLevels, currentLevel + 1],
            character: player.character,
            equipment: player.equipment,
            equippedItems: player.equippedItems as Record<string, Equipment>,
          })
        }
      } else if (shouldDropLoot(false)) {
        audioManager.playSfx('loot')
        const item = generateLoot(currentLevel)
        setLootItem(item)
      }
    } else {
      audioManager.playSfx('defeat')
      const shield = player?.equippedItems.shield
      if (shield && shield.bonus > 0) {
        equipItem(0, { ...shield, bonus: shield.bonus - 1 })
      } else {
        loseLife(0)
      }
    }
  }

  const handleLootClose = () => {
    if (lootItem) {
      addEquipment(0, lootItem)
      equipItem(0, lootItem)
    }
    setLootItem(null)
  }

  if (showLobby) {
    return <LobbyScreen onStart={() => setShowLobby(false)} onBack={() => setShowLobby(false)} />
  }

  if (phase === 'menu') {
    return <MainMenu onCoopClick={() => setShowLobby(true)} />
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GameScene />
      <HUD />
      <Inventory />
      <Dice />
      {players.length > 1 && <CoopHUD />}
      {players.length > 1 && <ShareLife />}
      {pendingChoices && <DirectionChoice choices={pendingChoices} onChoose={handleChoice} />}
      {combatActive && <CombatOverlay isBoss={combatActive.isBoss} onEnd={handleCombatEnd} />}
      {lootItem && <LootPopup item={lootItem} onClose={handleLootClose} />}
      {phase === 'result' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.85)', padding: '2rem 3rem',
          borderRadius: '12px', color: 'white', textAlign: 'center', zIndex: 200,
        }}>
          <h2 style={{ color: '#a78bfa', marginBottom: '1rem' }}>Level geschafft! 🎉</h2>
          <p style={{ marginBottom: '1rem' }}>Du hast den Endgegner besiegt!</p>
          <button
            onClick={() => {
              const nextLevel = currentLevel + 1
              if (nextLevel <= 10) {
                useGameStore.setState({
                  currentLevel: nextLevel,
                  phase: 'playing',
                  players: players.map(p => ({ ...p, lives: 2, currentTileId: 'start' })),
                  diceResult: null,
                })
              } else {
                useGameStore.setState({ phase: 'menu' })
              }
            }}
            style={{
              padding: '0.8rem 2rem', fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            {currentLevel < 10 ? 'Nächstes Level →' : '🏆 Spiel gewonnen!'}
          </button>
        </div>
      )}
    </div>
  )
}
