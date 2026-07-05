# Noés Abenteuer — Phase 2: Kampfsystem, Loot & Level

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vollständiges Kampfsystem (3 Mechaniken), Loot-Drops mit Seltenheitsstufen, Inventar-UI, und alle 10 Level-Daten.

**Architecture:** Kampf-Mechaniken als eigene React-Komponenten, die in einem Combat-Overlay rendern. Loot-System als reiner Datenlayer mit Generierungsfunktionen. Level-Daten als statische Dateien mit konsistentem Format.

**Tech Stack:** React 18, TypeScript, React Three Fiber, Zustand (erweitern)

---

## Dateistruktur (Phase 2 — neue/geänderte Dateien)

```
src/
├── game/
│   ├── combat.ts                   # Kampf-Logik & Zufallswahl
│   └── loot.ts                     # Loot-Generierung
├── components/
│   ├── combat/
│   │   ├── CombatOverlay.tsx       # Kampf-Container
│   │   ├── ClickBattle.tsx         # Schnelles Klicken
│   │   ├── DiceDuel.tsx            # Würfel-Duell
│   │   └── ReactionClick.tsx       # Reaktions-Klick
│   ├── Inventory.tsx               # Inventar-Leiste + Equip
│   └── LootPopup.tsx               # Item-Fund-Anzeige
├── data/
│   ├── items.ts                    # Item-Datenbank
│   └── levels/
│       ├── level1.ts  (erweitern)
│       ├── level2.ts
│       ├── level3.ts
│       ├── level4.ts
│       ├── level5.ts
│       ├── level6.ts
│       ├── level7.ts
│       ├── level8.ts
│       ├── level9.ts
│       └── level10.ts
└── tests/
    ├── combat.test.ts
    └── loot.test.ts
```

---

### Task 1: Kampf-Logik

**Files:**
- Create: `src/game/combat.ts`, `tests/combat.test.ts`

- [ ] **Step 1: Test schreiben**

```typescript
// tests/combat.test.ts
import { describe, it, expect } from 'vitest'
import { pickCombatType, calculateClickBattle, calculateDiceDuel, calculateReactionClick } from '../src/game/combat'
import { CombatType } from '../src/types/game'

describe('combat', () => {
  it('pickCombatType returns one of the three types', () => {
    for (let i = 0; i < 50; i++) {
      const type = pickCombatType()
      expect(['click', 'dice', 'reaction']).toContain(type)
    }
  })

  it('calculateClickBattle — win when clicks >= threshold', () => {
    const result = calculateClickBattle(25, 20)
    expect(result.won).toBe(true)
  })

  it('calculateClickBattle — lose when clicks < threshold', () => {
    const result = calculateClickBattle(10, 20)
    expect(result.won).toBe(false)
  })

  it('calculateDiceDuel — win when player roll > enemy roll', () => {
    const result = calculateDiceDuel(8, 5, 0)
    expect(result.won).toBe(true)
  })

  it('calculateDiceDuel — lose when player roll < enemy roll', () => {
    const result = calculateDiceDuel(3, 7, 0)
    expect(result.won).toBe(false)
  })

  it('calculateDiceDuel — weapon bonus adds to player roll', () => {
    const result = calculateDiceDuel(5, 7, 3)
    expect(result.playerTotal).toBe(8)
    expect(result.won).toBe(true)
  })

  it('calculateReactionClick — win when timing is in green zone', () => {
    const result = calculateReactionClick(0.5, 0.3, 0.7, 0)
    expect(result.won).toBe(true)
  })

  it('calculateReactionClick — lose when timing is outside green zone', () => {
    const result = calculateReactionClick(0.1, 0.3, 0.7, 0)
    expect(result.won).toBe(false)
  })

  it('calculateReactionClick — amulet bonus widens green zone', () => {
    const result = calculateReactionClick(0.2, 0.3, 0.7, 2)
    expect(result.greenStart).toBeLessThan(0.3)
    expect(result.won).toBe(true)
  })

  it('getClickThreshold scales with level', () => {
    const { getClickThreshold } = require('../src/game/combat')
    expect(getClickThreshold(1, false)).toBeLessThan(getClickThreshold(5, false))
    expect(getClickThreshold(1, true)).toBeGreaterThan(getClickThreshold(1, false))
  })
})
```

- [ ] **Step 2: Test ausführen — soll fehlschlagen**

```bash
npx vitest run tests/combat.test.ts
```

- [ ] **Step 3: Implementieren**

```typescript
// src/game/combat.ts
import { CombatType } from '@/types/game'

export function pickCombatType(): CombatType {
  const types: CombatType[] = ['click', 'dice', 'reaction']
  return types[Math.floor(Math.random() * 3)]
}

export function getClickThreshold(level: number, isBoss: boolean): number {
  const base = 15 + level * 2
  return isBoss ? base + 10 : base
}

export function getClickDuration(level: number, isBoss: boolean): number {
  const base = 5000 - level * 100
  return isBoss ? Math.max(base - 1000, 2000) : Math.max(base, 3000)
}

export function calculateClickBattle(clicks: number, threshold: number) {
  return { won: clicks >= threshold, clicks, threshold }
}

export function calculateDiceDuel(playerRoll: number, enemyRoll: number, weaponBonus: number) {
  const playerTotal = playerRoll + weaponBonus
  return { won: playerTotal > enemyRoll, playerTotal, enemyRoll }
}

export function getEnemyDiceBonus(level: number, isBoss: boolean): number {
  const base = Math.floor(level / 3)
  return isBoss ? base + 2 : base
}

export function calculateReactionClick(
  clickTiming: number,
  greenStart: number,
  greenEnd: number,
  amuletBonus: number
) {
  const bonusWidth = amuletBonus * 0.05
  const adjustedStart = Math.max(0, greenStart - bonusWidth)
  const adjustedEnd = Math.min(1, greenEnd + bonusWidth)
  const won = clickTiming >= adjustedStart && clickTiming <= adjustedEnd
  return { won, clickTiming, greenStart: adjustedStart, greenEnd: adjustedEnd }
}

export function getGreenZone(level: number, isBoss: boolean): { start: number; end: number } {
  const width = Math.max(0.15, 0.4 - level * 0.025)
  const bossWidth = isBoss ? width * 0.6 : width
  const center = 0.5
  return { start: center - bossWidth / 2, end: center + bossWidth / 2 }
}

export function getBossHitsRequired(level: number): number {
  return Math.min(2 + Math.floor(level / 3), 5)
}
```

- [ ] **Step 4: Tests bestehen**

```bash
npx vitest run tests/combat.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/combat.ts tests/combat.test.ts
git commit -m "feat: combat logic — click battle, dice duel, reaction click"
```

---

### Task 2: Kampf-UI — Schnelles Klicken

**Files:**
- Create: `src/components/combat/ClickBattle.tsx`

- [ ] **Step 1: ClickBattle erstellen**

```typescript
// src/components/combat/ClickBattle.tsx
import { useState, useEffect, useCallback } from 'react'
import { getClickThreshold, getClickDuration, calculateClickBattle } from '@/game/combat'
import { useGameStore } from '@/store/gameStore'

interface ClickBattleProps {
  level: number
  isBoss: boolean
  glovesBonus: number
  onResult: (won: boolean) => void
}

export function ClickBattle({ level, isBoss, glovesBonus, onResult }: ClickBattleProps) {
  const threshold = getClickThreshold(level, isBoss)
  const duration = getClickDuration(level, isBoss)
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (finished) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) {
          clearInterval(interval)
          setFinished(true)
          return 0
        }
        return t - 100
      })
    }, 100)
    return () => clearInterval(interval)
  }, [finished])

  useEffect(() => {
    if (finished) {
      const effectiveClicks = clicks * (1 + glovesBonus * 0.5)
      const { won } = calculateClickBattle(effectiveClicks, threshold)
      setTimeout(() => onResult(won), 1000)
    }
  }, [finished])

  const handleClick = useCallback(() => {
    if (!finished) setClicks((c) => c + 1)
  }, [finished])

  const progress = Math.min(clicks / threshold, 1)

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem', color: '#fbbf24' }}>⚡ Schnelles Klicken!</h2>
      <p style={{ marginBottom: '0.5rem' }}>Klicke so oft du kannst!</p>

      <div style={{ margin: '1rem 0', fontSize: '1.2rem' }}>
        ⏱️ {(timeLeft / 1000).toFixed(1)}s
      </div>

      <div style={{
        width: '100%',
        height: '20px',
        background: '#374151',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: progress >= 1 ? '#10b981' : '#f59e0b',
          transition: 'width 0.1s',
        }} />
      </div>

      <div
        onClick={handleClick}
        style={{
          width: '150px',
          height: '150px',
          margin: '0 auto',
          background: finished ? '#374151' : 'radial-gradient(circle, #ef4444, #991b1b)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          cursor: finished ? 'default' : 'pointer',
          userSelect: 'none',
          boxShadow: finished ? 'none' : '0 0 30px rgba(239, 68, 68, 0.5)',
        }}
      >
        {finished ? (progress >= 1 ? '✅' : '❌') : `${clicks}`}
      </div>

      <p style={{ marginTop: '1rem', opacity: 0.7 }}>
        {threshold - clicks > 0 ? `Noch ${Math.ceil(threshold - clicks)} Klicks nötig` : 'Geschafft!'}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/combat/ClickBattle.tsx
git commit -m "feat: click battle combat minigame UI"
```

---

### Task 3: Kampf-UI — Würfel-Duell

**Files:**
- Create: `src/components/combat/DiceDuel.tsx`

- [ ] **Step 1: DiceDuel erstellen**

```typescript
// src/components/combat/DiceDuel.tsx
import { useState } from 'react'
import { rollD10 } from '@/game/dice'
import { calculateDiceDuel, getEnemyDiceBonus } from '@/game/combat'

interface DiceDuelProps {
  level: number
  isBoss: boolean
  weaponBonus: number
  onResult: (won: boolean) => void
}

export function DiceDuel({ level, isBoss, weaponBonus, onResult }: DiceDuelProps) {
  const [playerRoll, setPlayerRoll] = useState<number | null>(null)
  const [enemyRoll, setEnemyRoll] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)

  const handleRoll = () => {
    if (rolling || result !== null) return
    setRolling(true)

    setTimeout(() => {
      const pRoll = rollD10()
      const eBonus = getEnemyDiceBonus(level, isBoss)
      const eRoll = rollD10() + eBonus

      setPlayerRoll(pRoll)
      setEnemyRoll(eRoll)
      setRolling(false)

      const { won } = calculateDiceDuel(pRoll, eRoll, weaponBonus)

      if (pRoll + weaponBonus === eRoll) {
        // Gleichstand — nochmal
        setTimeout(() => {
          setPlayerRoll(null)
          setEnemyRoll(null)
          setResult(null)
        }, 1500)
      } else {
        setResult(won)
        setTimeout(() => onResult(won), 1500)
      }
    }, 1000)
  }

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem', color: '#60a5fa' }}>🎲 Würfel-Duell!</h2>
      <p style={{ marginBottom: '1.5rem' }}>Wer höher würfelt, gewinnt!</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2rem' }}>
        {/* Spieler */}
        <div>
          <p style={{ marginBottom: '0.5rem' }}>Du {weaponBonus > 0 ? `(+${weaponBonus})` : ''}</p>
          <div style={{
            width: '80px', height: '80px',
            background: '#7c3aed',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold',
          }}>
            {rolling ? '?' : (playerRoll !== null ? playerRoll + weaponBonus : '—')}
          </div>
        </div>

        <div style={{ alignSelf: 'center', fontSize: '2rem' }}>⚔️</div>

        {/* Gegner */}
        <div>
          <p style={{ marginBottom: '0.5rem' }}>Gegner</p>
          <div style={{
            width: '80px', height: '80px',
            background: '#991b1b',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold',
          }}>
            {rolling ? '?' : (enemyRoll ?? '—')}
          </div>
        </div>
      </div>

      {result === null && (
        <button
          onClick={handleRoll}
          disabled={rolling}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.2rem',
            background: rolling ? '#374151' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: rolling ? 'default' : 'pointer',
          }}
        >
          {rolling ? 'Würfeln...' : 'Würfeln!'}
        </button>
      )}

      {result !== null && (
        <p style={{ fontSize: '1.5rem', color: result ? '#10b981' : '#ef4444' }}>
          {result ? '🎉 Gewonnen!' : '💀 Verloren!'}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/combat/DiceDuel.tsx
git commit -m "feat: dice duel combat minigame UI"
```

---

### Task 4: Kampf-UI — Reaktions-Klick

**Files:**
- Create: `src/components/combat/ReactionClick.tsx`

- [ ] **Step 1: ReactionClick erstellen**

```typescript
// src/components/combat/ReactionClick.tsx
import { useState, useEffect, useRef } from 'react'
import { getGreenZone, calculateReactionClick } from '@/game/combat'

interface ReactionClickProps {
  level: number
  isBoss: boolean
  amuletBonus: number
  onResult: (won: boolean) => void
}

export function ReactionClick({ level, isBoss, amuletBonus, onResult }: ReactionClickProps) {
  const [progress, setProgress] = useState(0)
  const [clicked, setClicked] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const animRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const duration = 2000

  const { start: greenStart, end: greenEnd } = getGreenZone(level, isBoss)

  useEffect(() => {
    startRef.current = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p < 1 && !clicked) {
        animRef.current = requestAnimationFrame(animate)
      } else if (p >= 1 && !clicked) {
        setClicked(true)
        setResult(false)
        setTimeout(() => onResult(false), 1000)
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  const handleClick = () => {
    if (clicked) return
    setClicked(true)
    const { won } = calculateReactionClick(progress, greenStart, greenEnd, amuletBonus)
    setResult(won)
    setTimeout(() => onResult(won), 1000)
  }

  const adjustedStart = Math.max(0, greenStart - amuletBonus * 0.05)
  const adjustedEnd = Math.min(1, greenEnd + amuletBonus * 0.05)

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <h2 style={{ marginBottom: '1rem', color: '#10b981' }}>🎯 Reaktions-Klick!</h2>
      <p style={{ marginBottom: '1.5rem' }}>Klicke im grünen Bereich!</p>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: '40px',
        background: '#374151', borderRadius: '8px',
        position: 'relative', overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        {/* Green zone */}
        <div style={{
          position: 'absolute',
          left: `${adjustedStart * 100}%`,
          width: `${(adjustedEnd - adjustedStart) * 100}%`,
          height: '100%',
          background: 'rgba(16, 185, 129, 0.4)',
        }} />

        {/* Indicator */}
        <div style={{
          position: 'absolute',
          left: `${progress * 100}%`,
          width: '4px', height: '100%',
          background: clicked ? (result ? '#10b981' : '#ef4444') : '#ffffff',
          transition: 'background 0.2s',
        }} />
      </div>

      <button
        onClick={handleClick}
        disabled={clicked}
        style={{
          width: '120px', height: '120px',
          borderRadius: '50%',
          background: clicked ? '#374151' : 'radial-gradient(circle, #10b981, #065f46)',
          border: 'none',
          fontSize: '2rem',
          color: 'white',
          cursor: clicked ? 'default' : 'pointer',
          boxShadow: clicked ? 'none' : '0 0 30px rgba(16, 185, 129, 0.5)',
        }}
      >
        {clicked ? (result ? '✅' : '❌') : '🎯'}
      </button>

      {result !== null && (
        <p style={{ marginTop: '1rem', fontSize: '1.3rem', color: result ? '#10b981' : '#ef4444' }}>
          {result ? '🎉 Perfektes Timing!' : '💀 Daneben!'}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/combat/ReactionClick.tsx
git commit -m "feat: reaction click combat minigame UI"
```

---

### Task 5: Kampf-Overlay (Container)

**Files:**
- Create: `src/components/combat/CombatOverlay.tsx`

- [ ] **Step 1: CombatOverlay erstellen**

```typescript
// src/components/combat/CombatOverlay.tsx
import { useState, useEffect } from 'react'
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
        setTimeout(() => setCombatType(pickCombatType()), 1000)
      }
    } else {
      onEnd(false)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      {isBoss && (
        <div style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '1.1rem' }}>
          Treffer: {bossHits} / {hitsRequired}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        {combatType === 'click' && (
          <ClickBattle level={currentLevel} isBoss={isBoss} glovesBonus={glovesBonus} onResult={handleRoundResult} />
        )}
        {combatType === 'dice' && (
          <DiceDuel level={currentLevel} isBoss={isBoss} weaponBonus={weaponBonus} onResult={handleRoundResult} />
        )}
        {combatType === 'reaction' && (
          <ReactionClick level={currentLevel} isBoss={isBoss} amuletBonus={amuletBonus} onResult={handleRoundResult} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/combat/CombatOverlay.tsx
git commit -m "feat: combat overlay container with boss multi-round logic"
```

---

### Task 6: Loot-System

**Files:**
- Create: `src/game/loot.ts`, `src/data/items.ts`, `tests/loot.test.ts`

- [ ] **Step 1: Test schreiben**

```typescript
// tests/loot.test.ts
import { describe, it, expect } from 'vitest'
import { generateLoot, getDropChance } from '../src/game/loot'

describe('loot', () => {
  it('generateLoot returns an item with valid properties', () => {
    const item = generateLoot(1)
    expect(item.id).toBeDefined()
    expect(item.name).toBeDefined()
    expect(item.slot).toBeDefined()
    expect(item.rarity).toBeDefined()
    expect(item.bonus).toBeGreaterThanOrEqual(1)
  })

  it('higher levels produce rarer items on average', () => {
    const rarities = { common: 0, rare: 0, epic: 0, legendary: 0 }
    for (let i = 0; i < 200; i++) {
      const item = generateLoot(10)
      rarities[item.rarity]++
    }
    expect(rarities.rare + rarities.epic + rarities.legendary).toBeGreaterThan(rarities.common)
  })

  it('getDropChance returns higher chance for bosses', () => {
    expect(getDropChance(true)).toBeGreaterThan(getDropChance(false))
  })
})
```

- [ ] **Step 2: Test ausführen — soll fehlschlagen**

```bash
npx vitest run tests/loot.test.ts
```

- [ ] **Step 3: Item-Datenbank erstellen**

```typescript
// src/data/items.ts
import { EquipmentSlot, Rarity } from '@/types/game'

interface ItemTemplate {
  name: string
  slot: EquipmentSlot
  rarity: Rarity
  bonus: number
  description: string
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  // Waffen
  { name: 'Rostschwert', slot: 'weapon', rarity: 'common', bonus: 1, description: '+1 beim Würfel-Duell' },
  { name: 'Stahlschwert', slot: 'weapon', rarity: 'rare', bonus: 2, description: '+2 beim Würfel-Duell' },
  { name: 'Flammenschwert', slot: 'weapon', rarity: 'epic', bonus: 3, description: '+3 beim Würfel-Duell' },
  { name: 'Sternenklingen', slot: 'weapon', rarity: 'legendary', bonus: 4, description: '+4 beim Würfel-Duell' },

  // Handschuhe
  { name: 'Lederhandschuhe', slot: 'gloves', rarity: 'common', bonus: 1, description: 'Klicks zählen etwas mehr' },
  { name: 'Schnelle Handschuhe', slot: 'gloves', rarity: 'rare', bonus: 2, description: 'Klicks zählen doppelt' },
  { name: 'Blitz-Handschuhe', slot: 'gloves', rarity: 'epic', bonus: 3, description: 'Klicks zählen dreifach' },
  { name: 'Donnerhandschuhe', slot: 'gloves', rarity: 'legendary', bonus: 4, description: 'Klicks zählen vierfach' },

  // Amulette
  { name: 'Holzamulett', slot: 'amulet', rarity: 'common', bonus: 1, description: 'Grüner Bereich etwas größer' },
  { name: 'Magisches Auge', slot: 'amulet', rarity: 'rare', bonus: 2, description: 'Grüner Bereich größer' },
  { name: 'Seherkristall', slot: 'amulet', rarity: 'epic', bonus: 3, description: 'Grüner Bereich viel größer' },
  { name: 'Allsehendes Auge', slot: 'amulet', rarity: 'legendary', bonus: 4, description: 'Riesiger grüner Bereich' },

  // Stiefel
  { name: 'Wanderstiefel', slot: 'boots', rarity: 'common', bonus: 1, description: '+1 beim Würfeln' },
  { name: 'Federstiefel', slot: 'boots', rarity: 'rare', bonus: 2, description: '+2 beim Würfeln' },
  { name: 'Raketenboots', slot: 'boots', rarity: 'epic', bonus: 3, description: '+3 beim Würfeln' },
  { name: 'Sternenstiefel', slot: 'boots', rarity: 'legendary', bonus: 4, description: '+4 beim Würfeln' },

  // Schilde
  { name: 'Holzschild', slot: 'shield', rarity: 'common', bonus: 1, description: '1x kein Lebensverlust' },
  { name: 'Eisenschild', slot: 'shield', rarity: 'rare', bonus: 1, description: '1x kein Lebensverlust' },
  { name: 'Kristallschild', slot: 'shield', rarity: 'epic', bonus: 1, description: '1x kein Lebensverlust' },
  { name: 'Drachenschild', slot: 'shield', rarity: 'legendary', bonus: 2, description: '2x kein Lebensverlust' },
]
```

- [ ] **Step 4: Loot-Generierung implementieren**

```typescript
// src/game/loot.ts
import { Equipment, Rarity } from '@/types/game'
import { ITEM_TEMPLATES } from '@/data/items'

const RARITY_WEIGHTS: Record<number, Record<Rarity, number>> = {
  1: { common: 70, rare: 25, epic: 5, legendary: 0 },
  3: { common: 50, rare: 35, epic: 13, legendary: 2 },
  5: { common: 35, rare: 35, epic: 25, legendary: 5 },
  7: { common: 20, rare: 35, epic: 35, legendary: 10 },
  10: { common: 10, rare: 30, epic: 40, legendary: 20 },
}

function getRarityWeights(level: number): Record<Rarity, number> {
  const keys = Object.keys(RARITY_WEIGHTS).map(Number).sort((a, b) => a - b)
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
  )
  return RARITY_WEIGHTS[closest]
}

function pickRarity(level: number): Rarity {
  const weights = getRarityWeights(level)
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight
    if (roll <= 0) return rarity as Rarity
  }
  return 'common'
}

export function generateLoot(level: number): Equipment {
  const rarity = pickRarity(level)
  const candidates = ITEM_TEMPLATES.filter(t => t.rarity === rarity)
  const template = candidates[Math.floor(Math.random() * candidates.length)]

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: template.name,
    slot: template.slot,
    rarity: template.rarity,
    bonus: template.bonus,
    description: template.description,
  }
}

export function getDropChance(isBoss: boolean): number {
  return isBoss ? 1.0 : 0.4
}

export function shouldDropLoot(isBoss: boolean): boolean {
  return Math.random() < getDropChance(isBoss)
}
```

- [ ] **Step 5: Tests bestehen**

```bash
npx vitest run tests/loot.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/loot.ts src/data/items.ts tests/loot.test.ts
git commit -m "feat: loot generation system with rarity scaling by level"
```

---

### Task 7: Inventar-UI

**Files:**
- Create: `src/components/Inventory.tsx`, `src/components/LootPopup.tsx`

- [ ] **Step 1: Inventory erstellen**

```typescript
// src/components/Inventory.tsx
import { useGameStore } from '@/store/gameStore'
import { Equipment, EquipmentSlot } from '@/types/game'

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
  const equipItem = useGameStore((s) => s.equipItem)
  const player = players[activePlayerIndex]

  if (!player) return null

  const slots: EquipmentSlot[] = ['weapon', 'gloves', 'amulet', 'boots', 'shield']

  return (
    <div style={{
      position: 'absolute',
      bottom: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      background: 'rgba(0,0,0,0.6)',
      padding: '0.5rem',
      borderRadius: '8px',
    }}>
      {slots.map((slot) => {
        const equipped = player.equippedItems[slot]
        return (
          <div
            key={slot}
            title={equipped ? `${equipped.name}: ${equipped.description}` : `Leer: ${slot}`}
            style={{
              width: '48px',
              height: '48px',
              background: equipped ? RARITY_COLORS[equipped.rarity] + '33' : '#1f293733',
              border: `2px solid ${equipped ? RARITY_COLORS[equipped.rarity] : '#4b5563'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
            }}
          >
            {equipped ? SLOT_ICONS[slot] : '·'}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: LootPopup erstellen**

```typescript
// src/components/LootPopup.tsx
import { Equipment } from '@/types/game'

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

const RARITY_LABELS = {
  common: 'Gewöhnlich',
  rare: 'Selten',
  epic: 'Episch',
  legendary: 'Legendär',
}

interface LootPopupProps {
  item: Equipment
  onClose: () => void
}

export function LootPopup({ item, onClose }: LootPopupProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#1f2937',
      border: `2px solid ${RARITY_COLORS[item.rarity]}`,
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'center',
      color: 'white',
      zIndex: 50,
      minWidth: '280px',
    }}>
      <p style={{ color: RARITY_COLORS[item.rarity], fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        {RARITY_LABELS[item.rarity]}
      </p>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{item.name}</h3>
      <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{item.description}</p>
      <button
        onClick={onClose}
        style={{
          padding: '0.7rem 2rem',
          background: RARITY_COLORS[item.rarity],
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Ausrüsten!
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Inventory.tsx src/components/LootPopup.tsx
git commit -m "feat: inventory display and loot popup UI"
```

---

### Task 8: Level-Daten (Level 2-10)

**Files:**
- Create: `src/data/levels/level2.ts` bis `src/data/levels/level10.ts`, `src/data/levels/index.ts`

- [ ] **Step 1: Level-Index erstellen**

```typescript
// src/data/levels/index.ts
import { LevelData } from '@/types/game'
import { level1 } from './level1'
import { level2 } from './level2'
import { level3 } from './level3'
import { level4 } from './level4'
import { level5 } from './level5'
import { level6 } from './level6'
import { level7 } from './level7'
import { level8 } from './level8'
import { level9 } from './level9'
import { level10 } from './level10'

export const LEVELS: LevelData[] = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10]

export function getLevel(id: number): LevelData {
  return LEVELS[id - 1]
}
```

- [ ] **Step 2: Level 2 — Pilz-Sumpf erstellen**

```typescript
// src/data/levels/level2.ts
import { LevelData } from '@/types/game'

export const level2: LevelData = {
  id: 2,
  name: 'Pilz-Sumpf',
  theme: 'swamp',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'snail', hidden: true, connections: ['t2'] },
    { id: 't2', position: { x: 0, y: 0, z: 4 }, type: 'normal', hidden: false, connections: ['t3', 't4'] },
    { id: 't3', position: { x: -2, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: 2, y: 0, z: 6 }, type: 'normal', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: -2, y: 0, z: 8 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't6', position: { x: 2, y: 0, z: 8 }, type: 'snail', hidden: true, connections: ['dead1'] },
    { id: 't7', position: { x: -2, y: 0, z: 10 }, type: 'rocket', hidden: true, connections: ['t8'] },
    { id: 't8', position: { x: 0, y: 0, z: 12 }, type: 'enemy', hidden: false, connections: ['t9'] },
    { id: 't9', position: { x: 0, y: 0, z: 14 }, type: 'car', hidden: true, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 16 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 2, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

- [ ] **Step 3: Level 3-10 erstellen (gleiche Struktur, unterschiedliche Layouts)**

Jedes Level folgt dem gleichen Pattern: Start → einige Normal-Felder → Abzweigung(en) → Gegner → Spezialfelder → Boss. Die Level werden länger und haben mehr Gegner/Fallen.

```typescript
// src/data/levels/level3.ts
import { LevelData } from '@/types/game'

export const level3: LevelData = {
  id: 3,
  name: 'Fledermaus-Höhle',
  theme: 'cave',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 1, y: 0, z: 2 }, type: 'normal', hidden: false, connections: ['t2'] },
    { id: 't2', position: { x: 2, y: 0, z: 4 }, type: 'enemy', hidden: false, connections: ['t3'] },
    { id: 't3', position: { x: 2, y: 0, z: 6 }, type: 'normal', hidden: false, connections: ['t4', 't5'] },
    { id: 't4', position: { x: 0, y: 0, z: 8 }, type: 'rocket', hidden: true, connections: ['t6'] },
    { id: 't5', position: { x: 4, y: 0, z: 8 }, type: 'enemy', hidden: false, connections: ['dead1'] },
    { id: 't6', position: { x: 0, y: 0, z: 10 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't7', position: { x: -1, y: 0, z: 12 }, type: 'snail', hidden: true, connections: ['t8'] },
    { id: 't8', position: { x: 0, y: 0, z: 14 }, type: 'normal', hidden: false, connections: ['t9', 't10'] },
    { id: 't9', position: { x: -2, y: 0, z: 16 }, type: 'car', hidden: true, connections: ['boss'] },
    { id: 't10', position: { x: 2, y: 0, z: 16 }, type: 'enemy', hidden: false, connections: ['dead2'] },
    { id: 'boss', position: { x: -2, y: 0, z: 18 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 4, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 2, y: 0, z: 18 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level4.ts
import { LevelData } from '@/types/game'

export const level4: LevelData = {
  id: 4,
  name: 'Wüste',
  theme: 'desert',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'snail', hidden: true, connections: ['t2', 't3'] },
    { id: 't2', position: { x: -2, y: 0, z: 4 }, type: 'normal', hidden: false, connections: ['t4'] },
    { id: 't3', position: { x: 2, y: 0, z: 4 }, type: 'enemy', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: -2, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: 2, y: 0, z: 6 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't6', position: { x: -3, y: 0, z: 8 }, type: 'car', hidden: true, connections: ['dead1'] },
    { id: 't7', position: { x: 2, y: 0, z: 8 }, type: 'normal', hidden: false, connections: ['t8'] },
    { id: 't8', position: { x: 1, y: 0, z: 10 }, type: 'rocket', hidden: true, connections: ['t9'] },
    { id: 't9', position: { x: 0, y: 0, z: 12 }, type: 'enemy', hidden: false, connections: ['t10'] },
    { id: 't10', position: { x: 0, y: 0, z: 14 }, type: 'normal', hidden: false, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 16 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: -3, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level5.ts
import { LevelData } from '@/types/game'

export const level5: LevelData = {
  id: 5,
  name: 'Unterwasser-Welt',
  theme: 'underwater',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'normal', hidden: false, connections: ['t2', 't3'] },
    { id: 't2', position: { x: -2, y: 0, z: 4 }, type: 'loot', hidden: true, connections: ['t4'] },
    { id: 't3', position: { x: 2, y: 0, z: 4 }, type: 'enemy', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: -2, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: 2, y: 0, z: 6 }, type: 'snail', hidden: true, connections: ['dead1'] },
    { id: 't6', position: { x: -1, y: 0, z: 8 }, type: 'normal', hidden: false, connections: ['t7'] },
    { id: 't7', position: { x: 0, y: 0, z: 10 }, type: 'rocket', hidden: true, connections: ['t8'] },
    { id: 't8', position: { x: 0, y: 0, z: 12 }, type: 'enemy', hidden: false, connections: ['t9', 't10'] },
    { id: 't9', position: { x: -2, y: 0, z: 14 }, type: 'car', hidden: true, connections: ['boss'] },
    { id: 't10', position: { x: 2, y: 0, z: 14 }, type: 'enemy', hidden: false, connections: ['dead2'] },
    { id: 'boss', position: { x: -2, y: 0, z: 16 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 2, y: 0, z: 8 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 2, y: 0, z: 16 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level6.ts
import { LevelData } from '@/types/game'

export const level6: LevelData = {
  id: 6,
  name: 'Eisberg / Schneewelt',
  theme: 'ice',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'snail', hidden: true, connections: ['t2'] },
    { id: 't2', position: { x: 0, y: 0, z: 4 }, type: 'enemy', hidden: false, connections: ['t3', 't4'] },
    { id: 't3', position: { x: -3, y: 0, z: 6 }, type: 'normal', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: 3, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: -3, y: 0, z: 8 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't6', position: { x: 3, y: 0, z: 8 }, type: 'rocket', hidden: true, connections: ['dead1'] },
    { id: 't7', position: { x: -2, y: 0, z: 10 }, type: 'enemy', hidden: false, connections: ['t8'] },
    { id: 't8', position: { x: -1, y: 0, z: 12 }, type: 'car', hidden: true, connections: ['t9'] },
    { id: 't9', position: { x: 0, y: 0, z: 14 }, type: 'normal', hidden: false, connections: ['t10', 't11'] },
    { id: 't10', position: { x: -2, y: 0, z: 16 }, type: 'snail', hidden: true, connections: ['boss'] },
    { id: 't11', position: { x: 2, y: 0, z: 16 }, type: 'enemy', hidden: false, connections: ['dead2'] },
    { id: 'boss', position: { x: -2, y: 0, z: 18 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 3, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 2, y: 0, z: 18 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level7.ts
import { LevelData } from '@/types/game'

export const level7: LevelData = {
  id: 7,
  name: 'Vulkan / Lava-Welt',
  theme: 'volcano',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'enemy', hidden: false, connections: ['t2'] },
    { id: 't2', position: { x: 0, y: 0, z: 4 }, type: 'normal', hidden: false, connections: ['t3', 't4'] },
    { id: 't3', position: { x: -2, y: 0, z: 6 }, type: 'snail', hidden: true, connections: ['t5'] },
    { id: 't4', position: { x: 2, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: -2, y: 0, z: 8 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't6', position: { x: 2, y: 0, z: 8 }, type: 'snail', hidden: true, connections: ['dead1'] },
    { id: 't7', position: { x: -1, y: 0, z: 10 }, type: 'enemy', hidden: false, connections: ['t8'] },
    { id: 't8', position: { x: 0, y: 0, z: 12 }, type: 'normal', hidden: false, connections: ['t9', 't10'] },
    { id: 't9', position: { x: -2, y: 0, z: 14 }, type: 'rocket', hidden: true, connections: ['t11'] },
    { id: 't10', position: { x: 2, y: 0, z: 14 }, type: 'enemy', hidden: false, connections: ['dead2'] },
    { id: 't11', position: { x: -1, y: 0, z: 16 }, type: 'enemy', hidden: false, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 18 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 2, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 2, y: 0, z: 16 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level8.ts
import { LevelData } from '@/types/game'

export const level8: LevelData = {
  id: 8,
  name: 'Geisterburg',
  theme: 'castle',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'enemy', hidden: false, connections: ['t2', 't3'] },
    { id: 't2', position: { x: -2, y: 0, z: 4 }, type: 'snail', hidden: true, connections: ['t4'] },
    { id: 't3', position: { x: 2, y: 0, z: 4 }, type: 'loot', hidden: true, connections: ['t5'] },
    { id: 't4', position: { x: -2, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: 2, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['dead1'] },
    { id: 't6', position: { x: -1, y: 0, z: 8 }, type: 'normal', hidden: false, connections: ['t7'] },
    { id: 't7', position: { x: 0, y: 0, z: 10 }, type: 'car', hidden: true, connections: ['t8'] },
    { id: 't8', position: { x: 0, y: 0, z: 12 }, type: 'enemy', hidden: false, connections: ['t9', 't10'] },
    { id: 't9', position: { x: -2, y: 0, z: 14 }, type: 'enemy', hidden: false, connections: ['t11'] },
    { id: 't10', position: { x: 2, y: 0, z: 14 }, type: 'snail', hidden: true, connections: ['dead2'] },
    { id: 't11', position: { x: -1, y: 0, z: 16 }, type: 'loot', hidden: false, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 18 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 2, y: 0, z: 8 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 2, y: 0, z: 16 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level9.ts
import { LevelData } from '@/types/game'

export const level9: LevelData = {
  id: 9,
  name: 'Wolkenstadt',
  theme: 'sky',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'enemy', hidden: false, connections: ['t2'] },
    { id: 't2', position: { x: 0, y: 0, z: 4 }, type: 'snail', hidden: true, connections: ['t3', 't4'] },
    { id: 't3', position: { x: -3, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: 3, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: -3, y: 0, z: 8 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't6', position: { x: 3, y: 0, z: 8 }, type: 'snail', hidden: true, connections: ['dead1'] },
    { id: 't7', position: { x: -2, y: 0, z: 10 }, type: 'normal', hidden: false, connections: ['t8'] },
    { id: 't8', position: { x: -1, y: 0, z: 12 }, type: 'enemy', hidden: false, connections: ['t9', 't10'] },
    { id: 't9', position: { x: -3, y: 0, z: 14 }, type: 'rocket', hidden: true, connections: ['t11'] },
    { id: 't10', position: { x: 1, y: 0, z: 14 }, type: 'enemy', hidden: false, connections: ['dead2'] },
    { id: 't11', position: { x: -2, y: 0, z: 16 }, type: 'enemy', hidden: false, connections: ['t12'] },
    { id: 't12', position: { x: -1, y: 0, z: 18 }, type: 'loot', hidden: true, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 20 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 3, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 1, y: 0, z: 16 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

```typescript
// src/data/levels/level10.ts
import { LevelData } from '@/types/game'

export const level10: LevelData = {
  id: 10,
  name: 'Sternenwelt',
  theme: 'space',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'enemy', hidden: false, connections: ['t2', 't3'] },
    { id: 't2', position: { x: -3, y: 0, z: 4 }, type: 'snail', hidden: true, connections: ['t4'] },
    { id: 't3', position: { x: 3, y: 0, z: 4 }, type: 'enemy', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: -3, y: 0, z: 6 }, type: 'enemy', hidden: false, connections: ['t6'] },
    { id: 't5', position: { x: 3, y: 0, z: 6 }, type: 'loot', hidden: true, connections: ['dead1'] },
    { id: 't6', position: { x: -2, y: 0, z: 8 }, type: 'loot', hidden: false, connections: ['t7'] },
    { id: 't7', position: { x: -1, y: 0, z: 10 }, type: 'enemy', hidden: false, connections: ['t8'] },
    { id: 't8', position: { x: 0, y: 0, z: 12 }, type: 'normal', hidden: false, connections: ['t9', 't10'] },
    { id: 't9', position: { x: -2, y: 0, z: 14 }, type: 'enemy', hidden: false, connections: ['t11'] },
    { id: 't10', position: { x: 2, y: 0, z: 14 }, type: 'snail', hidden: true, connections: ['dead2'] },
    { id: 't11', position: { x: -2, y: 0, z: 16 }, type: 'rocket', hidden: true, connections: ['t12'] },
    { id: 't12', position: { x: -1, y: 0, z: 18 }, type: 'enemy', hidden: false, connections: ['t13'] },
    { id: 't13', position: { x: 0, y: 0, z: 20 }, type: 'enemy', hidden: false, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 22 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: 3, y: 0, z: 8 }, type: 'normal', hidden: false, connections: [] },
    { id: 'dead2', position: { x: 2, y: 0, z: 16 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

- [ ] **Step 4: Commit**

```bash
git add src/data/levels/
git commit -m "feat: all 10 level data definitions with increasing difficulty"
```

---

### Task 9: Kampf + Loot in App.tsx integrieren

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: App.tsx aktualisieren mit Kampf- und Loot-Integration**

```typescript
// src/App.tsx
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { MainMenu } from '@/components/MainMenu'
import { GameScene } from '@/world/GameScene'
import { HUD } from '@/components/HUD'
import { Dice } from '@/components/Dice'
import { DirectionChoice } from '@/components/DirectionChoice'
import { Inventory } from '@/components/Inventory'
import { CombatOverlay } from '@/components/combat/CombatOverlay'
import { LootPopup } from '@/components/LootPopup'
import { getReachableTiles } from '@/game/movement'
import { getTileEffect } from '@/game/tileEffects'
import { generateLoot, shouldDropLoot } from '@/game/loot'
import { getLevel } from '@/data/levels'
import { Equipment } from '@/types/game'

export function App() {
  const phase = useGameStore((s) => s.phase)
  const diceResult = useGameStore((s) => s.diceResult)
  const players = useGameStore((s) => s.players)
  const currentLevel = useGameStore((s) => s.currentLevel)
  const movePlayer = useGameStore((s) => s.movePlayer)
  const setPhase = useGameStore((s) => s.setPhase)
  const setWaiting = useGameStore((s) => s.setWaiting)
  const loseLife = useGameStore((s) => s.loseLife)
  const completeLevel = useGameStore((s) => s.completeLevel)
  const addEquipment = useGameStore((s) => s.addEquipment)
  const equipItem = useGameStore((s) => s.equipItem)

  const [pendingChoices, setPendingChoices] = useState<string[] | null>(null)
  const [combatActive, setCombatActive] = useState<{ isBoss: boolean } | null>(null)
  const [lootItem, setLootItem] = useState<Equipment | null>(null)

  const player = players[0]
  const level = getLevel(currentLevel)

  const handleTileEffect = (tileId: string) => {
    const tile = level.tiles.find(t => t.id === tileId)
    if (!tile) return

    const effect = getTileEffect(tile.type)
    switch (effect.type) {
      case 'wait':
        setWaiting(Date.now() + effect.duration)
        break
      case 'advance': {
        const next = getReachableTiles(level.tiles, tileId, effect.steps)
        if (next.length === 1) {
          movePlayer(0, next[0])
          handleTileEffect(next[0])
        } else {
          setPendingChoices(next)
        }
        break
      }
      case 'combat':
        setCombatActive({ isBoss: effect.isBoss })
        break
      case 'loot': {
        const item = generateLoot(currentLevel)
        setLootItem(item)
        break
      }
    }
  }

  // Handle dice result
  if (diceResult !== null && player && !pendingChoices && !combatActive && !lootItem) {
    const reachable = getReachableTiles(level.tiles, player.currentTileId, diceResult)

    if (reachable.length === 1) {
      movePlayer(0, reachable[0])
      handleTileEffect(reachable[0])
    } else if (reachable.length > 1) {
      setPendingChoices(reachable)
    }
  }

  const handleChoice = (tileId: string) => {
    movePlayer(0, tileId)
    setPendingChoices(null)
    handleTileEffect(tileId)
  }

  const handleCombatEnd = (won: boolean) => {
    const isBoss = combatActive?.isBoss ?? false
    setCombatActive(null)

    if (won) {
      if (isBoss) {
        completeLevel()
      } else if (shouldDropLoot(false)) {
        const item = generateLoot(currentLevel)
        setLootItem(item)
      }
    } else {
      const hasShield = player.equippedItems.shield && player.equippedItems.shield.bonus > 0
      if (hasShield) {
        // Shield absorbs damage — decrement bonus
        equipItem(0, { ...player.equippedItems.shield!, bonus: player.equippedItems.shield!.bonus - 1 })
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

  if (phase === 'menu') {
    return <MainMenu />
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GameScene />
      <HUD />
      <Inventory />
      <Dice />
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
```

- [ ] **Step 2: Dev-Server testen**

```bash
npx vite
```

Expected: Vollständiger Spielablauf mit Kämpfen, Loot-Drops und Level-Wechsel.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate combat system and loot into main game loop"
```

---

## Phase 2 — Zusammenfassung

Nach Abschluss aller 9 Tasks hat man:
- 3 Kampf-Mechaniken (Schnelles Klicken, Würfel-Duell, Reaktions-Klick)
- Zufällige Kampf-Auswahl als Überraschung
- Boss-Kämpfe mit mehreren Runden
- Loot-System mit 4 Seltenheitsstufen
- 20 verschiedene Items über 5 Ausrüstungs-Slots
- Inventar-UI mit Equip-Funktion
- Alle 10 Level-Daten mit steigender Schwierigkeit
- Level-Wechsel nach Boss-Sieg

**Nächste Phase:** Koop-Multiplayer (WebSocket LAN) & Audio
