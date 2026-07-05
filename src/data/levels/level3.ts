import { LevelData } from '@/types/game'

export const level3: LevelData = {
  id: 3, name: 'Fledermaus-Höhle', theme: 'cave', startTileId: 'start', bossTileId: 'boss',
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
