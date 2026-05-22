export type Team = {
  name: string;
  score: number;
  emoji: string;
  color1: string;
  color2: string;
};

export const DEFAULT_TEAMS_BY_COUNT: Record<2 | 3 | 4, Team[]> = {
  2: [
    { name: 'Mehndi', score: 0, emoji: 'M', color1: '#ff2d6f', color2: '#ffd166' },
    { name: 'Sangeet', score: 0, emoji: 'S', color1: '#2cd4c0', color2: '#7a3eb1' },
  ],
  3: [
    { name: 'Mehndi', score: 0, emoji: 'M', color1: '#ff2d6f', color2: '#ffd166' },
    { name: 'Sangeet', score: 0, emoji: 'S', color1: '#2cd4c0', color2: '#7a3eb1' },
    { name: 'Baraat', score: 0, emoji: 'B', color1: '#ff8c42', color2: '#ffd166' },
  ],
  4: [
    { name: 'Mehndi', score: 0, emoji: 'M', color1: '#ff2d6f', color2: '#ffd166' },
    { name: 'Sangeet', score: 0, emoji: 'S', color1: '#2cd4c0', color2: '#7a3eb1' },
    { name: 'Baraat', score: 0, emoji: 'B', color1: '#ff8c42', color2: '#ffd166' },
    { name: 'Vidaai', score: 0, emoji: 'V', color1: '#3dffb1', color2: '#2cd4c0' },
  ],
};

export const PALETTE_PRESETS: Array<[string, string]> = [
  ['#ff2d6f', '#ffd166'],
  ['#2cd4c0', '#7a3eb1'],
  ['#ff8c42', '#ffd166'],
  ['#3dffb1', '#2cd4c0'],
  ['#7a3eb1', '#ff2d6f'],
  ['#c81d77', '#ffd166'],
];
