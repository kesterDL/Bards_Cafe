// src/constants/MOCK_DATA.ts
import { Adventure } from '../types';

export const MOCK_ADVENTURES: Adventure[] = [
  { id: '1', title: 'The Whispering Crypt', author: 'Elara Meadowlight', price: 9.99, levelMin: 1, levelMax: 3, theme: 'Undead', coverImageUrl: 'https://placehold.co/600x400/2d3748/edf2f7?text=Whispering+Crypt', shortDescription: 'A haunted crypt rumored to hold ancient secrets.', longDescription: 'Delve into the depths of the Whispering Crypt, where restless spirits guard forgotten lore...' },
  { id: '2', title: 'Curse of the Sunken City', author: 'Finnian Wavecrest', price: 12.50, levelMin: 5, levelMax: 7, theme: 'Aquatic', coverImageUrl: 'https://placehold.co/600x400/3182ce/eBF4FF?text=Sunken+City', shortDescription: 'Explore a mysterious underwater city plagued by a dark curse.', longDescription: 'The legendary Sunken City of Aethel has resurfaced, but it is not the glorious metropolis of old...' },
  { id: '3', title: 'The Dragon\'s Hoard of Mount Cinder', author: 'Ignis Stonebeard', price: 15.00, levelMin: 8, levelMax: 10, theme: 'Dragon', coverImageUrl: 'https://placehold.co/600x400/c53030/fff5f5?text=Dragon%27s+Hoard', shortDescription: 'Dare to claim the treasure guarded by a fearsome red dragon.', longDescription: 'Mount Cinder is home to Ignis, a cunning and powerful red dragon...' },
  { id: '4', title: 'Secrets of the Feywild Glade', author: 'Lyra Moonpetal', price: 8.00, levelMin: 3, levelMax: 5, theme: 'Fey', coverImageUrl: 'https://placehold.co/600x400/38a169/f0fff4?text=Feywild+Glade', shortDescription: 'Navigate the enchanting and treacherous paths of a fey-controlled forest.', longDescription: 'A hidden glade, touched by the chaotic magic of the Feywild, beckons...' },
  { id: '5', title: 'The Clockwork Tower of Gizmo', author: 'Professor Cogsworth', price: 11.25, levelMin: 4, levelMax: 6, theme: 'Steampunk', coverImageUrl: 'https://placehold.co/600x400/718096/e2e8f0?text=Clockwork+Tower', shortDescription: 'Ascend a tower full of mechanical wonders and deadly constructs.', longDescription: 'The eccentric inventor Professor Gizmo has vanished, leaving behind his magnificent Clockwork Tower...' },
];

export const THEMES: string[] = ['All', 'Undead', 'Aquatic', 'Dragon', 'Fey', 'Steampunk', 'Mystery', 'Intrigue', 'Horror'];
export const LEVEL_RANGES: string[] = ['All', '1-3', '3-5', '5-7', '8-10', '10+'];
