import { level1 } from '@/data/levels/level1'

interface DirectionChoiceProps {
  choices: string[]
  onChoose: (tileId: string) => void
}

export function DirectionChoice({ choices, onChoose }: DirectionChoiceProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      gap: '1.5rem',
    }}>
      {choices.map((tileId, index) => {
        const label = index === 0 ? '← Links' : '→ Rechts'
        return (
          <button
            key={tileId}
            onClick={() => onChoose(tileId)}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
