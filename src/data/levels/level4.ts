import { LevelData } from '@/types/game'

export const level4: LevelData = {
  id: 4, name: 'Wüste', theme: 'desert', startTileId: 'start', bossTileId: 'boss',
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
