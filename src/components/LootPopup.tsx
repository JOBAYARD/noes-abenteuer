import { Equipment } from '@/types/game'

const RARITY_COLORS = { common: '#9ca3af', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' }
const RARITY_LABELS = { common: 'Gewöhnlich', rare: 'Selten', epic: 'Episch', legendary: 'Legendär' }

interface LootPopupProps {
  item: Equipment
  onClose: () => void
}

export function LootPopup({ item, onClose }: LootPopupProps) {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1f2937', border: `2px solid ${RARITY_COLORS[item.rarity]}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'white', zIndex: 50, minWidth: '280px' }}>
      <p style={{ color: RARITY_COLORS[item.rarity], fontSize: '0.9rem', marginBottom: '0.5rem' }}>{RARITY_LABELS[item.rarity]}</p>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{item.name}</h3>
      <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{item.description}</p>
      <button onClick={onClose} style={{ padding: '0.7rem 2rem', background: RARITY_COLORS[item.rarity], color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
        Ausrüsten!
      </button>
    </div>
  )
}
