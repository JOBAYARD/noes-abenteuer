# Noés Abenteuer — Phase 1: Grundgerüst + Erstes Level

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein spielbares erstes Level (Dunkler Wald) im Browser — Figur bewegt sich über Felder, Würfel funktioniert, Spezialfelder wirken, Abzweigungen funktionieren.

**Architecture:** React-App mit Vite als Bundler. React Three Fiber rendert die 3D-Welt. Zustand verwaltet den gesamten Spielstatus. Das Level ist als Datenstruktur (Graph) definiert — Felder sind Knoten, Verbindungen sind Kanten.

**Tech Stack:** React 18, TypeScript, Vite, React Three Fiber, Drei (R3F helpers), Zustand

---

## Dateistruktur (Phase 1)

```
C:/Code/zz_Noe/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Router: Menü vs. Spiel
│   ├── store/
│   │   └── gameStore.ts            # Zustand store (Spielstatus)
│   ├── types/
│   │   └── game.ts                 # TypeScript-Typen
│   ├── data/
│   │   └── levels/
│   │       └── level1.ts           # Level-1-Definition (Felder, Verbindungen)
│   ├── components/
│   │   ├── MainMenu.tsx            # Hauptmenü
│   │   ├── HUD.tsx                 # Lebensanzeige, Level-Info
│   │   ├── Dice.tsx                # Klickbarer Würfel
│   │   └── DirectionChoice.tsx     # Richtungswahl bei Abzweigung
│   ├── world/
│   │   ├── GameScene.tsx           # R3F Canvas + Kamera
│   │   ├── BoardPath.tsx           # Rendert alle Felder als 3D-Objekte
│   │   ├── PlayerModel.tsx         # Spielfigur (Mensch/Tiger)
│   │   └── Tile.tsx                # Einzelnes Feld (3D-Mesh)
│   └── game/
│       ├── dice.ts                 # Würfel-Logik
│       ├── movement.ts            # Bewegungs-Logik (Pfad entlang)
│       └── tileEffects.ts          # Spezialfeld-Effekte
└── tests/
    ├── dice.test.ts
    ├── movement.test.ts
    ├── tileEffects.test.ts
    └── gameStore.test.ts
```

---

### Task 1: Projekt-Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`

- [ ] **Step 1: Projekt initialisieren**

```bash
cd C:/Code/zz_Noe
npm init -y
```

- [ ] **Step 2: Dependencies installieren**

```bash
npm install react react-dom @react-three/fiber @react-three/drei three zustand
npm install -D typescript @types/react @types/react-dom @types/three vite @vitejs/plugin-react vitest @testing-library/react jsdom
```

- [ ] **Step 3: tsconfig.json erstellen**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: vite.config.ts erstellen**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    host: true
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

- [ ] **Step 5: index.html erstellen**

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Noés Abenteuer</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body, #root { width: 100%; height: 100%; overflow: hidden; }
      body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: src/main.tsx erstellen**

```typescript
import { createRoot } from 'react-dom/client'
import { App } from './App'

createRoot(document.getElementById('root')!).render(<App />)
```

- [ ] **Step 7: src/App.tsx Platzhalter erstellen**

```typescript
export function App() {
  return <div style={{ color: 'white', padding: '2rem' }}>Noés Abenteuer</div>
}
```

- [ ] **Step 8: Dev-Server starten und verifizieren**

```bash
npx vite
```

Expected: Browser zeigt "Noés Abenteuer" auf dunklem Hintergrund.

- [ ] **Step 9: Commit**

```bash
git init
echo "node_modules\ndist\n.superpowers" > .gitignore
git add .
git commit -m "feat: project setup with Vite + React + R3F + TypeScript"
```

---

### Task 2: TypeScript-Typen definieren

**Files:**
- Create: `src/types/game.ts`

- [ ] **Step 1: Typen-Datei erstellen**

```typescript
export type TileType = 'normal' | 'snail' | 'rocket' | 'car' | 'enemy' | 'boss' | 'loot'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type EquipmentSlot = 'weapon' | 'gloves' | 'amulet' | 'boots' | 'shield'

export type CombatType = 'click' | 'dice' | 'reaction'

export type CharacterType = 'human' | 'tiger'

export interface Position {
  x: number
  y: number
  z: number
}

export interface Tile {
  id: string
  position: Position
  type: TileType
  hidden: boolean
  connections: string[]
}

export interface LevelData {
  id: number
  name: string
  theme: string
  tiles: Tile[]
  startTileId: string
  bossTileId: string
}

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: Rarity
  bonus: number
  description: string
}

export interface Player {
  id: string
  character: CharacterType
  currentTileId: string
  lives: number
  equipment: Equipment[]
  equippedItems: Partial<Record<EquipmentSlot, Equipment>>
}

export interface GameState {
  phase: 'menu' | 'playing' | 'combat' | 'result'
  currentLevel: number
  players: Player[]
  activePlayerIndex: number
  unlockedLevels: number[]
  diceResult: number | null
  waitingUntil: number | null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/game.ts
git commit -m "feat: define core TypeScript types for game entities"
```

---

### Task 3: Game Store (Zustand)

**Files:**
- Create: `src/store/gameStore.ts`, `tests/gameStore.test.ts`

- [ ] **Step 1: Test schreiben**

```typescript
// tests/gameStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../src/store/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.getState().reset()
  })

  it('starts in menu phase', () => {
    const state = useGameStore.getState()
    expect(state.phase).toBe('menu')
  })

  it('starts a new game with correct initial state', () => {
    const { startGame } = useGameStore.getState()
    startGame('human')
    const state = useGameStore.getState()
    expect(state.phase).toBe('playing')
    expect(state.currentLevel).toBe(1)
    expect(state.players[0].character).toBe('human')
    expect(state.players[0].lives).toBe(2)
  })

  it('rolls dice and returns value between 1 and 10', () => {
    const { startGame, rollDice } = useGameStore.getState()
    startGame('human')
    rollDice()
    const state = useGameStore.getState()
    expect(state.diceResult).toBeGreaterThanOrEqual(1)
    expect(state.diceResult).toBeLessThanOrEqual(10)
  })

  it('loses a life correctly', () => {
    const { startGame, loseLife } = useGameStore.getState()
    startGame('tiger')
    loseLife(0)
    const state = useGameStore.getState()
    expect(state.players[0].lives).toBe(1)
  })

  it('resets level when lives reach 0', () => {
    const { startGame, loseLife } = useGameStore.getState()
    startGame('human')
    loseLife(0)
    loseLife(0)
    const state = useGameStore.getState()
    expect(state.players[0].lives).toBe(2)
    expect(state.players[0].currentTileId).toBe('start')
  })
})
```

- [ ] **Step 2: Test ausführen — soll fehlschlagen**

```bash
npx vitest run tests/gameStore.test.ts
```

Expected: FAIL — Module not found.

- [ ] **Step 3: Store implementieren**

```typescript
// src/store/gameStore.ts
import { create } from 'zustand'
import { CharacterType, Equipment, EquipmentSlot, GameState, Player } from '@/types/game'
import { level1 } from '@/data/levels/level1'

interface GameActions {
  reset: () => void
  startGame: (character: CharacterType) => void
  rollDice: () => void
  movePlayer: (playerIndex: number, tileId: string) => void
  loseLife: (playerIndex: number) => void
  addEquipment: (playerIndex: number, item: Equipment) => void
  equipItem: (playerIndex: number, item: Equipment) => void
  setPhase: (phase: GameState['phase']) => void
  setWaiting: (until: number | null) => void
  completeLevel: () => void
}

const initialState: GameState = {
  phase: 'menu',
  currentLevel: 1,
  players: [],
  activePlayerIndex: 0,
  unlockedLevels: [1],
  diceResult: null,
  waitingUntil: null,
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  reset: () => set(initialState),

  startGame: (character) => {
    const player: Player = {
      id: 'player1',
      character,
      currentTileId: 'start',
      lives: 2,
      equipment: [],
      equippedItems: {},
    }
    set({
      phase: 'playing',
      currentLevel: 1,
      players: [player],
      activePlayerIndex: 0,
      unlockedLevels: [1],
      diceResult: null,
    })
  },

  rollDice: () => {
    const result = Math.floor(Math.random() * 10) + 1
    const { players, activePlayerIndex } = get()
    const player = players[activePlayerIndex]
    const bootsBonus = player.equippedItems.boots?.bonus ?? 0
    set({ diceResult: Math.min(result + bootsBonus, 10) })
  },

  movePlayer: (playerIndex, tileId) => {
    set((state) => {
      const players = [...state.players]
      players[playerIndex] = { ...players[playerIndex], currentTileId: tileId }
      return { players, diceResult: null }
    })
  },

  loseLife: (playerIndex) => {
    set((state) => {
      const players = [...state.players]
      const player = { ...players[playerIndex] }
      player.lives -= 1
      if (player.lives <= 0) {
        player.lives = 2
        player.currentTileId = 'start'
      }
      players[playerIndex] = player
      return { players }
    })
  },

  addEquipment: (playerIndex, item) => {
    set((state) => {
      const players = [...state.players]
      players[playerIndex] = {
        ...players[playerIndex],
        equipment: [...players[playerIndex].equipment, item],
      }
      return { players }
    })
  },

  equipItem: (playerIndex, item) => {
    set((state) => {
      const players = [...state.players]
      players[playerIndex] = {
        ...players[playerIndex],
        equippedItems: { ...players[playerIndex].equippedItems, [item.slot]: item },
      }
      return { players }
    })
  },

  setPhase: (phase) => set({ phase }),

  setWaiting: (until) => set({ waitingUntil: until }),

  completeLevel: () => {
    set((state) => {
      const nextLevel = state.currentLevel + 1
      const unlockedLevels = state.unlockedLevels.includes(nextLevel)
        ? state.unlockedLevels
        : [...state.unlockedLevels, nextLevel]
      return { phase: 'result', unlockedLevels }
    })
  },
}))
```

- [ ] **Step 4: Level-1-Daten-Platzhalter erstellen (für Import)**

```typescript
// src/data/levels/level1.ts
import { LevelData } from '@/types/game'

export const level1: LevelData = {
  id: 1,
  name: 'Dunkler Wald',
  theme: 'forest',
  startTileId: 'start',
  bossTileId: 'boss',
  tiles: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, type: 'normal', hidden: false, connections: ['t1'] },
    { id: 't1', position: { x: 0, y: 0, z: 2 }, type: 'normal', hidden: false, connections: ['t2'] },
    { id: 't2', position: { x: 0, y: 0, z: 4 }, type: 'rocket', hidden: true, connections: ['t3', 't4'] },
    { id: 't3', position: { x: -2, y: 0, z: 6 }, type: 'normal', hidden: false, connections: ['t5'] },
    { id: 't4', position: { x: 2, y: 0, z: 6 }, type: 'snail', hidden: true, connections: ['t6'] },
    { id: 't5', position: { x: -2, y: 0, z: 8 }, type: 'enemy', hidden: false, connections: ['dead1'] },
    { id: 't6', position: { x: 2, y: 0, z: 8 }, type: 'normal', hidden: false, connections: ['t7'] },
    { id: 't7', position: { x: 2, y: 0, z: 10 }, type: 'car', hidden: true, connections: ['t8'] },
    { id: 't8', position: { x: 2, y: 0, z: 12 }, type: 'loot', hidden: false, connections: ['t9'] },
    { id: 't9', position: { x: 0, y: 0, z: 14 }, type: 'normal', hidden: false, connections: ['boss'] },
    { id: 'boss', position: { x: 0, y: 0, z: 16 }, type: 'boss', hidden: false, connections: [] },
    { id: 'dead1', position: { x: -2, y: 0, z: 10 }, type: 'normal', hidden: false, connections: [] },
  ],
}
```

- [ ] **Step 5: Tests ausführen — sollen bestehen**

```bash
npx vitest run tests/gameStore.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/store/gameStore.ts src/data/levels/level1.ts tests/gameStore.test.ts
git commit -m "feat: game store with Zustand + level 1 data structure"
```

---

### Task 4: Würfel-Logik

**Files:**
- Create: `src/game/dice.ts`, `tests/dice.test.ts`

- [ ] **Step 1: Test schreiben**

```typescript
// tests/dice.test.ts
import { describe, it, expect } from 'vitest'
import { rollD10, rollWithBonus } from '../src/game/dice'

describe('dice', () => {
  it('rollD10 returns value between 1 and 10', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollD10()
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    }
  })

  it('rollWithBonus adds bonus and caps at 10', () => {
    const result = rollWithBonus(3)
    expect(result).toBeGreaterThanOrEqual(4)
    expect(result).toBeLessThanOrEqual(10)
  })

  it('rollWithBonus with 0 bonus is same as rollD10', () => {
    const result = rollWithBonus(0)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(10)
  })
})
```

- [ ] **Step 2: Test ausführen — soll fehlschlagen**

```bash
npx vitest run tests/dice.test.ts
```

- [ ] **Step 3: Implementieren**

```typescript
// src/game/dice.ts
export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1
}

export function rollWithBonus(bonus: number): number {
  return Math.min(rollD10() + bonus, 10)
}
```

- [ ] **Step 4: Tests bestehen**

```bash
npx vitest run tests/dice.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/dice.ts tests/dice.test.ts
git commit -m "feat: dice logic with d10 roll and equipment bonus"
```

---

### Task 5: Bewegungs-Logik

**Files:**
- Create: `src/game/movement.ts`, `tests/movement.test.ts`

- [ ] **Step 1: Test schreiben**

```typescript
// tests/movement.test.ts
import { describe, it, expect } from 'vitest'
import { getReachableTiles, getPathForSteps } from '../src/game/movement'
import { level1 } from '../src/data/levels/level1'

describe('movement', () => {
  it('getReachableTiles returns correct tiles for 1 step', () => {
    const tiles = getReachableTiles(level1.tiles, 'start', 1)
    expect(tiles).toEqual(['t1'])
  })

  it('getReachableTiles returns correct tiles for 2 steps', () => {
    const tiles = getReachableTiles(level1.tiles, 'start', 2)
    expect(tiles).toEqual(['t2'])
  })

  it('getReachableTiles stops at fork and returns choices', () => {
    const tiles = getReachableTiles(level1.tiles, 't1', 2)
    expect(tiles.sort()).toEqual(['t3', 't4'].sort())
  })

  it('getPathForSteps returns intermediate path', () => {
    const path = getPathForSteps(level1.tiles, 'start', 't2')
    expect(path).toEqual(['start', 't1', 't2'])
  })

  it('getReachableTiles stops at dead end', () => {
    const tiles = getReachableTiles(level1.tiles, 'dead1', 3)
    expect(tiles).toEqual(['dead1'])
  })
})
```

- [ ] **Step 2: Test ausführen — soll fehlschlagen**

```bash
npx vitest run tests/movement.test.ts
```

- [ ] **Step 3: Implementieren**

```typescript
// src/game/movement.ts
import { Tile } from '@/types/game'

export function getReachableTiles(tiles: Tile[], fromId: string, steps: number): string[] {
  const tileMap = new Map(tiles.map(t => [t.id, t]))

  function walk(currentId: string, remaining: number): string[] {
    if (remaining === 0) return [currentId]

    const tile = tileMap.get(currentId)
    if (!tile || tile.connections.length === 0) return [currentId]

    if (tile.connections.length > 1 && currentId !== fromId) {
      return tile.connections
    }

    if (tile.connections.length === 1) {
      return walk(tile.connections[0], remaining - 1)
    }

    // From the starting tile with multiple connections and steps > 0:
    // walk each direction
    const results: string[] = []
    for (const nextId of tile.connections) {
      results.push(...walk(nextId, remaining - 1))
    }
    return [...new Set(results)]
  }

  return walk(fromId, steps)
}

export function getPathForSteps(tiles: Tile[], fromId: string, toId: string): string[] {
  const tileMap = new Map(tiles.map(t => [t.id, t]))
  const visited = new Set<string>()
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [fromId] }]

  while (queue.length > 0) {
    const { id, path } = queue.shift()!
    if (id === toId) return path
    if (visited.has(id)) continue
    visited.add(id)

    const tile = tileMap.get(id)
    if (!tile) continue
    for (const nextId of tile.connections) {
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] })
      }
    }
  }

  return [fromId]
}
```

- [ ] **Step 4: Tests bestehen**

```bash
npx vitest run tests/movement.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/movement.ts tests/movement.test.ts
git commit -m "feat: movement logic — path traversal with fork detection"
```

---

### Task 6: Spezialfeld-Effekte

**Files:**
- Create: `src/game/tileEffects.ts`, `tests/tileEffects.test.ts`

- [ ] **Step 1: Test schreiben**

```typescript
// tests/tileEffects.test.ts
import { describe, it, expect } from 'vitest'
import { getTileEffect } from '../src/game/tileEffects'

describe('tileEffects', () => {
  it('normal tile has no effect', () => {
    const effect = getTileEffect('normal')
    expect(effect).toEqual({ type: 'none' })
  })

  it('snail tile causes wait', () => {
    const effect = getTileEffect('snail')
    expect(effect).toEqual({ type: 'wait', duration: 60000 })
  })

  it('rocket tile moves forward 6', () => {
    const effect = getTileEffect('rocket')
    expect(effect).toEqual({ type: 'advance', steps: 6 })
  })

  it('car tile moves forward 4', () => {
    const effect = getTileEffect('car')
    expect(effect).toEqual({ type: 'advance', steps: 4 })
  })

  it('enemy tile triggers combat', () => {
    const effect = getTileEffect('enemy')
    expect(effect).toEqual({ type: 'combat', isBoss: false })
  })

  it('boss tile triggers boss combat', () => {
    const effect = getTileEffect('boss')
    expect(effect).toEqual({ type: 'combat', isBoss: true })
  })

  it('loot tile gives item', () => {
    const effect = getTileEffect('loot')
    expect(effect).toEqual({ type: 'loot' })
  })
})
```

- [ ] **Step 2: Test ausführen — soll fehlschlagen**

```bash
npx vitest run tests/tileEffects.test.ts
```

- [ ] **Step 3: Implementieren**

```typescript
// src/game/tileEffects.ts
import { TileType } from '@/types/game'

export type TileEffect =
  | { type: 'none' }
  | { type: 'wait'; duration: number }
  | { type: 'advance'; steps: number }
  | { type: 'combat'; isBoss: boolean }
  | { type: 'loot' }

export function getTileEffect(tileType: TileType): TileEffect {
  switch (tileType) {
    case 'normal': return { type: 'none' }
    case 'snail': return { type: 'wait', duration: 60000 }
    case 'rocket': return { type: 'advance', steps: 6 }
    case 'car': return { type: 'advance', steps: 4 }
    case 'enemy': return { type: 'combat', isBoss: false }
    case 'boss': return { type: 'combat', isBoss: true }
    case 'loot': return { type: 'loot' }
  }
}
```

- [ ] **Step 4: Tests bestehen**

```bash
npx vitest run tests/tileEffects.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/tileEffects.ts tests/tileEffects.test.ts
git commit -m "feat: tile effect logic for all field types"
```

---

### Task 7: 3D-Szene — Kamera & Basis

**Files:**
- Create: `src/world/GameScene.tsx`

- [ ] **Step 1: GameScene erstellen**

```typescript
// src/world/GameScene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { BoardPath } from './BoardPath'
import { PlayerModel } from './PlayerModel'
import { useGameStore } from '@/store/gameStore'

export function GameScene() {
  const currentLevel = useGameStore((s) => s.currentLevel)

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[0, 12, -6]} fov={50} />
      <OrbitControls
        target={[0, 0, 6]}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={8}
        maxDistance={20}
      />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <fog attach="fog" args={['#1a1a2e', 15, 40]} />
      <BoardPath />
      <PlayerModel />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </Canvas>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/world/GameScene.tsx
git commit -m "feat: 3D scene setup with camera, lighting, and ground plane"
```

---

### Task 8: 3D-Felder rendern

**Files:**
- Create: `src/world/Tile.tsx`, `src/world/BoardPath.tsx`

- [ ] **Step 1: Tile-Komponente erstellen**

```typescript
// src/world/Tile.tsx
import { useRef } from 'react'
import { Mesh } from 'three'
import { Tile as TileData } from '@/types/game'

const TILE_COLORS: Record<string, string> = {
  normal: '#4a5568',
  snail: '#4a5568',
  rocket: '#4a5568',
  car: '#4a5568',
  enemy: '#742a2a',
  boss: '#5b21b6',
  loot: '#92400e',
}

const REVEALED_COLORS: Record<string, string> = {
  snail: '#d97706',
  rocket: '#2563eb',
  car: '#059669',
}

interface TileProps {
  tile: TileData
  revealed: boolean
}

export function TileModel({ tile, revealed }: TileProps) {
  const meshRef = useRef<Mesh>(null)
  const color = revealed && !tile.hidden ? (REVEALED_COLORS[tile.type] ?? TILE_COLORS[tile.type]) : TILE_COLORS[tile.type]

  return (
    <mesh
      ref={meshRef}
      position={[tile.position.x, tile.position.y, tile.position.z]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[0.6, 0.6, 0.2, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
    </mesh>
  )
}
```

- [ ] **Step 2: BoardPath-Komponente erstellen**

```typescript
// src/world/BoardPath.tsx
import { level1 } from '@/data/levels/level1'
import { useGameStore } from '@/store/gameStore'
import { TileModel } from './Tile'

export function BoardPath() {
  const players = useGameStore((s) => s.players)
  const currentPlayerTile = players[0]?.currentTileId

  return (
    <group>
      {level1.tiles.map((tile) => {
        const revealed = tile.id === currentPlayerTile || !tile.hidden
        return <TileModel key={tile.id} tile={tile} revealed={revealed} />
      })}
    </group>
  )
}
```

- [ ] **Step 3: Dev-Server prüfen**

```bash
npx vite
```

Expected: 3D-Szene mit hexagonalen Feldern auf grünem Boden sichtbar.

- [ ] **Step 4: Commit**

```bash
git add src/world/Tile.tsx src/world/BoardPath.tsx
git commit -m "feat: render level tiles as 3D hexagonal meshes"
```

---

### Task 9: Spielfigur

**Files:**
- Create: `src/world/PlayerModel.tsx`

- [ ] **Step 1: PlayerModel erstellen**

```typescript
// src/world/PlayerModel.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { useGameStore } from '@/store/gameStore'
import { level1 } from '@/data/levels/level1'

export function PlayerModel() {
  const meshRef = useRef<Mesh>(null)
  const players = useGameStore((s) => s.players)
  const player = players[0]

  useFrame(() => {
    if (!meshRef.current || !player) return
    const tile = level1.tiles.find(t => t.id === player.currentTileId)
    if (!tile) return

    const target = new Vector3(tile.position.x, tile.position.y + 0.7, tile.position.z)
    meshRef.current.position.lerp(target, 0.08)
  })

  if (!player) return null

  const isHuman = player.character === 'human'

  return (
    <mesh ref={meshRef} position={[0, 0.7, 0]} castShadow>
      {isHuman ? (
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
      ) : (
        <sphereGeometry args={[0.35, 8, 8]} />
      )}
      <meshStandardMaterial
        color={isHuman ? '#c4b5fd' : '#f59e0b'}
        emissive={isHuman ? '#7c3aed' : '#d97706'}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/world/PlayerModel.tsx
git commit -m "feat: animated player model that follows current tile position"
```

---

### Task 10: Würfel-UI

**Files:**
- Create: `src/components/Dice.tsx`

- [ ] **Step 1: Dice-Komponente erstellen**

```typescript
// src/components/Dice.tsx
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export function Dice() {
  const [rolling, setRolling] = useState(false)
  const rollDice = useGameStore((s) => s.rollDice)
  const diceResult = useGameStore((s) => s.diceResult)
  const phase = useGameStore((s) => s.phase)
  const waitingUntil = useGameStore((s) => s.waitingUntil)

  const isWaiting = waitingUntil !== null && Date.now() < waitingUntil
  const canRoll = phase === 'playing' && !rolling && diceResult === null && !isWaiting

  const handleRoll = () => {
    if (!canRoll) return
    setRolling(true)
    setTimeout(() => {
      rollDice()
      setRolling(false)
    }, 800)
  }

  return (
    <div
      onClick={handleRoll}
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '80px',
        background: canRoll ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#374151',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canRoll ? 'pointer' : 'default',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
        boxShadow: canRoll ? '0 0 20px rgba(124, 58, 237, 0.5)' : 'none',
        transition: 'all 0.2s',
        userSelect: 'none',
        animation: rolling ? 'shake 0.1s infinite' : 'none',
      }}
    >
      {rolling ? '?' : (diceResult ?? '🎲')}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Dice.tsx
git commit -m "feat: clickable dice UI component with roll animation"
```

---

### Task 11: Richtungswahl-UI

**Files:**
- Create: `src/components/DirectionChoice.tsx`

- [ ] **Step 1: DirectionChoice erstellen**

```typescript
// src/components/DirectionChoice.tsx
import { useGameStore } from '@/store/gameStore'
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
        const tile = level1.tiles.find(t => t.id === tileId)
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DirectionChoice.tsx
git commit -m "feat: direction choice UI for path forks"
```

---

### Task 12: HUD (Lebensanzeige + Level-Info)

**Files:**
- Create: `src/components/HUD.tsx`

- [ ] **Step 1: HUD erstellen**

```typescript
// src/components/HUD.tsx
import { useGameStore } from '@/store/gameStore'
import { level1 } from '@/data/levels/level1'

export function HUD() {
  const players = useGameStore((s) => s.players)
  const currentLevel = useGameStore((s) => s.currentLevel)
  const player = players[0]

  if (!player) return null

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Leben */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.5rem' }}>
          {Array.from({ length: player.lives }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
          {Array.from({ length: 2 - player.lives }).map((_, i) => (
            <span key={i} style={{ opacity: 0.3 }}>🖤</span>
          ))}
        </div>

        {/* Level-Info */}
        <div style={{
          color: 'white',
          fontSize: '1.1rem',
          background: 'rgba(0,0,0,0.5)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
        }}>
          Level {currentLevel} — {level1.name}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HUD.tsx
git commit -m "feat: HUD with lives display and level info"
```

---

### Task 13: Hauptmenü

**Files:**
- Create: `src/components/MainMenu.tsx`

- [ ] **Step 1: MainMenu erstellen**

```typescript
// src/components/MainMenu.tsx
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { CharacterType } from '@/types/game'

export function MainMenu() {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('human')
  const startGame = useGameStore((s) => s.startGame)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)',
      color: 'white',
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '0.5rem',
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
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              background: selectedCharacter === 'human' ? '#7c3aed' : '#374151',
              color: 'white',
              border: selectedCharacter === 'human' ? '2px solid #a78bfa' : '2px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            🧙 Mensch
          </button>
          <button
            onClick={() => setSelectedCharacter('tiger')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              background: selectedCharacter === 'tiger' ? '#d97706' : '#374151',
              color: 'white',
              border: selectedCharacter === 'tiger' ? '2px solid #fbbf24' : '2px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            🐯 Tiger
          </button>
        </div>
      </div>

      <button
        onClick={() => startGame(selectedCharacter)}
        style={{
          padding: '1rem 3rem',
          fontSize: '1.3rem',
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
        }}
      >
        Spiel starten
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MainMenu.tsx
git commit -m "feat: main menu with character selection"
```

---

### Task 14: Alles zusammenbauen — App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: App.tsx zusammenbauen**

```typescript
// src/App.tsx
import { useState } from 'react'
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
  const setPhase = useGameStore((s) => s.setPhase)
  const setWaiting = useGameStore((s) => s.setWaiting)
  const loseLife = useGameStore((s) => s.loseLife)
  const completeLevel = useGameStore((s) => s.completeLevel)

  const [pendingChoices, setPendingChoices] = useState<string[] | null>(null)

  const player = players[0]

  // Handle dice result
  if (diceResult !== null && player && !pendingChoices) {
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
  }

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
```

- [ ] **Step 2: CSS-Animation für Würfel in index.html hinzufügen**

Ergänze im `<style>` Block in `index.html`:

```css
@keyframes shake {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  25% { transform: translateX(-50%) rotate(-5deg); }
  75% { transform: translateX(-50%) rotate(5deg); }
}
```

- [ ] **Step 3: Dev-Server starten und verifizieren**

```bash
npx vite
```

Expected: Hauptmenü → Figurwahl → Spielstart → 3D-Szene mit Feldern, Würfel klicken, Figur bewegt sich.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx index.html
git commit -m "feat: wire up full game loop — menu, dice, movement, tile effects"
```

---

## Phase 1 — Zusammenfassung

Nach Abschluss aller 14 Tasks hat man:
- Funktionierendes Hauptmenü mit Figurwahl
- 3D-Welt mit sichtbaren Feldern
- Klickbarer 10er-Würfel
- Figur bewegt sich animiert über den Pfad
- Spezialfelder (Schnecke, Rakete, Auto) funktionieren
- Abzweigungen mit Richtungswahl
- Lebensystem (2 Leben, Level-Reset)
- Grundgerüst für Kampf und Loot (Platzhalter)

**Nächste Phase:** Kampfsystem (3 Mechaniken), Loot-Drops, 10 Level-Daten
