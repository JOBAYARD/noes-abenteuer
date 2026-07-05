import { LevelData } from '@/types/game'

export const level6: LevelData = {
  id: 6, name: 'Eisberg / Schneewelt', theme: 'ice', startTileId: 'start', bossTileId: 'boss',
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
