import { Equipment } from '@/types/game'

interface SaveData {
  currentLevel: number
  unlockedLevels: number[]
  character: string
  equipment: Equipment[]
  equippedItems: Record<string, Equipment>
  savedAt: string
}

const SAVE_KEY = 'noes-abenteuer-save'

export function saveGame(data: Omit<SaveData, 'savedAt'>) {
  const save: SaveData = { ...data, savedAt: new Date().toISOString() }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

export function loadGame(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as SaveData }
  catch { return null }
}

export function hasSaveGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function deleteSaveGame() {
  localStorage.removeItem(SAVE_KEY)
}
