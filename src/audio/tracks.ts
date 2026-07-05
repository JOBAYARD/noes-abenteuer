export interface TrackDef {
  key: string
  src: string
  loop: boolean
  volume: number
}

export const MUSIC_TRACKS: Record<string, TrackDef> = {
  menu: { key: 'menu', src: '/audio/music/menu.mp3', loop: true, volume: 0.4 },
  forest: { key: 'forest', src: '/audio/music/forest.mp3', loop: true, volume: 0.3 },
  swamp: { key: 'swamp', src: '/audio/music/swamp.mp3', loop: true, volume: 0.3 },
  cave: { key: 'cave', src: '/audio/music/cave.mp3', loop: true, volume: 0.3 },
  desert: { key: 'desert', src: '/audio/music/desert.mp3', loop: true, volume: 0.3 },
  underwater: { key: 'underwater', src: '/audio/music/underwater.mp3', loop: true, volume: 0.3 },
  ice: { key: 'ice', src: '/audio/music/ice.mp3', loop: true, volume: 0.3 },
  volcano: { key: 'volcano', src: '/audio/music/volcano.mp3', loop: true, volume: 0.3 },
  castle: { key: 'castle', src: '/audio/music/castle.mp3', loop: true, volume: 0.3 },
  sky: { key: 'sky', src: '/audio/music/sky.mp3', loop: true, volume: 0.3 },
  space: { key: 'space', src: '/audio/music/space.mp3', loop: true, volume: 0.3 },
  combat: { key: 'combat', src: '/audio/music/combat.mp3', loop: true, volume: 0.4 },
}

export const SFX: Record<string, TrackDef> = {
  dice_roll: { key: 'dice_roll', src: '/audio/sfx/dice.mp3', loop: false, volume: 0.6 },
  step: { key: 'step', src: '/audio/sfx/step.mp3', loop: false, volume: 0.4 },
  hit: { key: 'hit', src: '/audio/sfx/hit.mp3', loop: false, volume: 0.5 },
  victory: { key: 'victory', src: '/audio/sfx/victory.mp3', loop: false, volume: 0.7 },
  defeat: { key: 'defeat', src: '/audio/sfx/defeat.mp3', loop: false, volume: 0.5 },
  loot: { key: 'loot', src: '/audio/sfx/loot.mp3', loop: false, volume: 0.6 },
  snail: { key: 'snail', src: '/audio/sfx/snail.mp3', loop: false, volume: 0.5 },
  rocket: { key: 'rocket', src: '/audio/sfx/rocket.mp3', loop: false, volume: 0.6 },
  level_complete: { key: 'level_complete', src: '/audio/sfx/fanfare.mp3', loop: false, volume: 0.8 },
}
