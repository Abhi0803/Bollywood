export type Era = '90s' | '2000s' | '2010s' | '2020s';
export type Mood =
  | 'Romantic'
  | 'Wedding'
  | 'Party'
  | 'Sufi'
  | 'Anthemic'
  | 'Period'
  | 'Coming-of-age'
  | 'Roadtrip';

export type Song = {
  id: string;
  song: string;
  movie: string;
  year: number;
  director: string;
  cast: string;
  plot: string;
  duration: number;
  swatch: [string, string];
  era: Era;
  mood: Mood;
};

export type HintKey = 'year' | 'mood' | 'director' | 'cast' | 'plot';
export type Hint = { key: HintKey; label: string; cost: number; icon: string };

export const SONGS: Song[] = [
  {
    id: 's1',
    song: 'Bole Chudiyan',
    movie: 'Kabhi Khushi Kabhie Gham',
    year: 2001,
    director: 'Karan Johar',
    cast: 'Amitabh Bachchan, Shah Rukh Khan, Kajol, Hrithik Roshan',
    plot: 'A family torn apart by tradition and the heir who was disowned.',
    duration: 354,
    swatch: ['#ff2d6f', '#ffd166'],
    era: '2000s',
    mood: 'Wedding',
  },
  {
    id: 's2',
    song: 'Tum Hi Ho',
    movie: 'Aashiqui 2',
    year: 2013,
    director: 'Mohit Suri',
    cast: 'Aditya Roy Kapur, Shraddha Kapoor',
    plot: 'A fading rockstar mentors a young singer; love and self-destruction follow.',
    duration: 263,
    swatch: ['#7a3eb1', '#2cd4c0'],
    era: '2010s',
    mood: 'Romantic',
  },
  {
    id: 's3',
    song: 'Senorita',
    movie: 'Zindagi Na Milegi Dobara',
    year: 2011,
    director: 'Zoya Akhtar',
    cast: 'Hrithik Roshan, Farhan Akhtar, Abhay Deol, Katrina Kaif',
    plot: 'Three friends take a bachelor road trip through Spain.',
    duration: 217,
    swatch: ['#ff8c42', '#ffd166'],
    era: '2010s',
    mood: 'Roadtrip',
  },
  {
    id: 's4',
    song: 'Give Me Some Sunshine',
    movie: '3 Idiots',
    year: 2009,
    director: 'Rajkumar Hirani',
    cast: 'Aamir Khan, R. Madhavan, Sharman Joshi, Kareena Kapoor',
    plot: 'Two friends search for a long-lost classmate who changed their lives at engineering college.',
    duration: 252,
    swatch: ['#ffd166', '#2cd4c0'],
    era: '2000s',
    mood: 'Coming-of-age',
  },
  {
    id: 's5',
    song: 'Deewani Mastani',
    movie: 'Bajirao Mastani',
    year: 2015,
    director: 'Sanjay Leela Bhansali',
    cast: 'Ranveer Singh, Deepika Padukone, Priyanka Chopra',
    plot: 'A Maratha warrior falls for a Muslim princess against the will of his court.',
    duration: 363,
    swatch: ['#c81d77', '#ffd166'],
    era: '2010s',
    mood: 'Period',
  },
  {
    id: 's6',
    song: 'Tujhe Dekha To',
    movie: 'Dilwale Dulhania Le Jayenge',
    year: 1995,
    director: 'Aditya Chopra',
    cast: 'Shah Rukh Khan, Kajol',
    plot: 'A young woman on a Eurorail trip meets the man who will change everything.',
    duration: 320,
    swatch: ['#f3c623', '#1a7431'],
    era: '90s',
    mood: 'Romantic',
  },
  {
    id: 's7',
    song: 'Badtameez Dil',
    movie: 'Yeh Jawaani Hai Deewani',
    year: 2013,
    director: 'Ayan Mukerji',
    cast: 'Ranbir Kapoor, Deepika Padukone',
    plot: 'A wanderer and a bookish girl meet at a Manali trek and reunite a decade later.',
    duration: 256,
    swatch: ['#ff2d6f', '#7a3eb1'],
    era: '2010s',
    mood: 'Party',
  },
  {
    id: 's8',
    song: 'Kun Faya Kun',
    movie: 'Rockstar',
    year: 2011,
    director: 'Imtiaz Ali',
    cast: 'Ranbir Kapoor, Nargis Fakhri',
    plot: 'A college kid becomes a tortured rockstar after losing the love of his life.',
    duration: 460,
    swatch: ['#2a1448', '#ff8c42'],
    era: '2010s',
    mood: 'Sufi',
  },
  {
    id: 's9',
    song: 'Chaiyya Chaiyya',
    movie: 'Dil Se..',
    year: 1998,
    director: 'Mani Ratnam',
    cast: 'Shah Rukh Khan, Malaika Arora, Manisha Koirala',
    plot: 'A radio journalist becomes obsessed with a mysterious woman tied to an insurgency.',
    duration: 411,
    swatch: ['#c81d77', '#ffd166'],
    era: '90s',
    mood: 'Anthemic',
  },
  {
    id: 's10',
    song: 'Tum Se Hi',
    movie: 'Jab We Met',
    year: 2007,
    director: 'Imtiaz Ali',
    cast: 'Shahid Kapoor, Kareena Kapoor',
    plot: 'A heartbroken businessman finds himself stuck with a chatty Punjabi girl on a train.',
    duration: 312,
    swatch: ['#ff8c42', '#2cd4c0'],
    era: '2000s',
    mood: 'Romantic',
  },
  {
    id: 's11',
    song: 'Ghoomar',
    movie: 'Padmaavat',
    year: 2018,
    director: 'Sanjay Leela Bhansali',
    cast: 'Deepika Padukone, Ranveer Singh, Shahid Kapoor',
    plot: 'A Rajput queen becomes the obsession of a Sultan who will burn empires to possess her.',
    duration: 246,
    swatch: ['#c81d77', '#ffd166'],
    era: '2010s',
    mood: 'Period',
  },
  {
    id: 's12',
    song: 'Kal Ho Naa Ho',
    movie: 'Kal Ho Naa Ho',
    year: 2003,
    director: 'Nikkhil Advani',
    cast: 'Shah Rukh Khan, Preity Zinta, Saif Ali Khan',
    plot: 'A New York family is rescued by a charming stranger with a secret.',
    duration: 314,
    swatch: ['#7a3eb1', '#ff2d6f'],
    era: '2000s',
    mood: 'Romantic',
  },
];

export const HINTS: Hint[] = [
  { key: 'year', label: 'Year of release', cost: 10, icon: '◔' },
  { key: 'mood', label: 'Mood', cost: 10, icon: '✦' },
  { key: 'director', label: 'Director', cost: 15, icon: '◐' },
  { key: 'cast', label: 'Cast', cost: 20, icon: '◑' },
  { key: 'plot', label: 'Plot snippet', cost: 25, icon: '◕' },
];

export const ALL_ERAS: Era[] = ['90s', '2000s', '2010s', '2020s'];
export const ALL_MOODS: Mood[] = [
  'Romantic',
  'Wedding',
  'Party',
  'Sufi',
  'Anthemic',
  'Period',
  'Coming-of-age',
  'Roadtrip',
];
