import { useGameStore } from '@/store/gameStore'
import { EquipmentSlot } from '@/types/game'

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  weapon: '⚔️',
  gloves: '🧤',
  amulet: '🔮',
  boots: '👟',
  shield: '🛡️',
}

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export function Inventory() {
  const players = useGameStore((s) => s.players)
  const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)
  const player = players[activePlayerIndex]

  if (!player) return null

  const slots: EquipmentSlot[] = ['weapon', 'gloves', 'amulet', 'boots', 'shield']

  return (
    <div style={{ position: 'absolute', bottom: '5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '8px' }}>
      {slots.map((slot) => {
        const equipped = player.equippedItems[slot]
        return (
          <div key={slot} title={equipped ? `${equipped.name}: ${equipped.description}` : `Leer: ${slot}`} style={{ width: '48px', height: '48px', background: equipped ? RARITY_COLORS[equipped.rarity] + '33' : '#1f293733', border: `2px solid ${equipped ? RARITY_COLORS[equipped.rarity] : '#4b5563'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            {equipped ? SLOT_ICONS[slot] : '·'}
          </div>
        )
      })}
    </div>
  )
}
