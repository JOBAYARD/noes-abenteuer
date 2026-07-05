import { EquipmentSlot, Rarity } from '@/types/game'

interface ItemTemplate {
  name: string
  slot: EquipmentSlot
  rarity: Rarity
  bonus: number
  description: string
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  { name: 'Rostschwert', slot: 'weapon', rarity: 'common', bonus: 1, description: '+1 beim Würfel-Duell' },
  { name: 'Stahlschwert', slot: 'weapon', rarity: 'rare', bonus: 2, description: '+2 beim Würfel-Duell' },
  { name: 'Flammenschwert', slot: 'weapon', rarity: 'epic', bonus: 3, description: '+3 beim Würfel-Duell' },
  { name: 'Sternenklingen', slot: 'weapon', rarity: 'legendary', bonus: 4, description: '+4 beim Würfel-Duell' },
  { name: 'Lederhandschuhe', slot: 'gloves', rarity: 'common', bonus: 1, description: 'Klicks zählen etwas mehr' },
  { name: 'Schnelle Handschuhe', slot: 'gloves', rarity: 'rare', bonus: 2, description: 'Klicks zählen doppelt' },
  { name: 'Blitz-Handschuhe', slot: 'gloves', rarity: 'epic', bonus: 3, description: 'Klicks zählen dreifach' },
  { name: 'Donnerhandschuhe', slot: 'gloves', rarity: 'legendary', bonus: 4, description: 'Klicks zählen vierfach' },
  { name: 'Holzamulett', slot: 'amulet', rarity: 'common', bonus: 1, description: 'Grüner Bereich etwas größer' },
  { name: 'Magisches Auge', slot: 'amulet', rarity: 'rare', bonus: 2, description: 'Grüner Bereich größer' },
  { name: 'Seherkristall', slot: 'amulet', rarity: 'epic', bonus: 3, description: 'Grüner Bereich viel größer' },
  { name: 'Allsehendes Auge', slot: 'amulet', rarity: 'legendary', bonus: 4, description: 'Riesiger grüner Bereich' },
  { name: 'Wanderstiefel', slot: 'boots', rarity: 'common', bonus: 1, description: '+1 beim Würfeln' },
  { name: 'Federstiefel', slot: 'boots', rarity: 'rare', bonus: 2, description: '+2 beim Würfeln' },
  { name: 'Raketenboots', slot: 'boots', rarity: 'epic', bonus: 3, description: '+3 beim Würfeln' },
  { name: 'Sternenstiefel', slot: 'boots', rarity: 'legendary', bonus: 4, description: '+4 beim Würfeln' },
  { name: 'Holzschild', slot: 'shield', rarity: 'common', bonus: 1, description: '1x kein Lebensverlust' },
  { name: 'Eisenschild', slot: 'shield', rarity: 'rare', bonus: 1, description: '1x kein Lebensverlust' },
  { name: 'Kristallschild', slot: 'shield', rarity: 'epic', bonus: 1, description: '1x kein Lebensverlust' },
  { name: 'Drachenschild', slot: 'shield', rarity: 'legendary', bonus: 2, description: '2x kein Lebensverlust' },
]
