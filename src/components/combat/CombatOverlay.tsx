import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { pickCombatType, getBossHitsRequired } from '@/game/combat'
import { ClickBattle } from './ClickBattle'
import { DiceDuel } from './DiceDuel'
import { ReactionClick } from './ReactionClick'
import { CombatType } from '@/types/game'

interface CombatOverlayProps {
  isBoss: boolean
  onEnd: (won: boolean) => void
}

export function CombatOverlay({ isBoss, onEnd }: CombatOverlayProps) {
  const currentLevel = useGameStore((s) => s.currentLevel)
  const players = useGameStore((s) => s.players)
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)
  const player = players[activePlayerIndex]

  const [combatType, setCombatType] = useState<CombatType>(() => pickCombatType())
  const [bossHits, setBossHits] = useState(0)
  const [roundKey, setRoundKey] = useState(0)
  const hitsRequired = isBoss ? getBossHitsRequired(currentLevel) : 1

  const weaponBonus = player.equippedItems.weapon?.bonus ?? 0
  const glovesBonus = player.equippedItems.gloves?.bonus ?? 0
  const amuletBonus = player.equippedItems.amulet?.bonus ?? 0

  const handleRoundResult = (won: boolean) => {
    if (won) {
      const newHits = bossHits + 1
      if (newHits >= hitsRequired) {
        setTimeout(() => onEnd(true), 500)
      } else {
        setBossHits(newHits)
        setTimeout(() => {
          setCombatType(pickCombatType())
          setRoundKey((k) => k + 1)
        }, 1000)
      }
    } else {
      onEnd(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      {isBoss && (
        <div style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Treffer: {bossHits} / {hitsRequired}
        </div>
      )}
      <div key={roundKey} style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        {combatType === 'click' && <ClickBattle level={currentLevel} isBoss={isBoss} glovesBonus={glovesBonus} onResult={handleRoundResult} />}
        {combatType === 'dice' && <DiceDuel level={currentLevel} isBoss={isBoss} weaponBonus={weaponBonus} onResult={handleRoundResult} />}
        {combatType === 'reaction' && <ReactionClick level={currentLevel} isBoss={isBoss} amuletBonus={amuletBonus} onResult={handleRoundResult} />}
      </div>
    </div>
  )
}
