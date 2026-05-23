// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A SONG
//
// Append a new entry to SONGS below. Required fields:
//   id          unique string, e.g. 's48'
//   song        track title as it appears on iTunes
//   movie       film name (used to score iTunes lookups; spell it as iTunes does)
//   year        release year
//   director    primary director (one name; comma if truly co-directed)
//   cast        2–4 leads, comma-separated
//   plot        one-sentence hook, no spoilers
//   duration    seconds, rough
//   swatch      [primary, secondary] hex for the Reveal poster
//   era         '90s' | '2000s' | '2010s' | '2020s'
//   mood        see ALL_MOODS below
//   popularity  1 = iconic / everyone knows
//               2 = well-known among Bollywood fans
//               3 = deep cut for hardcore fans (currently unused — reserved)
// ─────────────────────────────────────────────────────────────────────────────

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

export type Popularity = 1 | 2 | 3;

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
  popularity: Popularity;
};

export type HintKey = 'year' | 'mood' | 'director' | 'cast' | 'plot';
export type Hint = { key: HintKey; label: string; cost: number; icon: string };

const PINK_GOLD: [string, string] = ['#ff2d6f', '#ffd166'];
const PURPLE_TEAL: [string, string] = ['#7a3eb1', '#2cd4c0'];
const ORANGE_GOLD: [string, string] = ['#ff8c42', '#ffd166'];
const GOLD_TEAL: [string, string] = ['#ffd166', '#2cd4c0'];
const DARKPINK_GOLD: [string, string] = ['#c81d77', '#ffd166'];
const YELLOW_GREEN: [string, string] = ['#f3c623', '#1a7431'];
const PINK_PURPLE: [string, string] = ['#ff2d6f', '#7a3eb1'];
const DARK_ORANGE: [string, string] = ['#2a1448', '#ff8c42'];
const ORANGE_TEAL: [string, string] = ['#ff8c42', '#2cd4c0'];
const PURPLE_PINK: [string, string] = ['#7a3eb1', '#ff2d6f'];

export const SONGS: Song[] = [
  // ── 90s ──────────────────────────────────────────────────────────────────
  {
    id: 's6', song: 'Tujhe Dekha To', movie: 'Dilwale Dulhania Le Jayenge', year: 1995,
    director: 'Aditya Chopra', cast: 'Shah Rukh Khan, Kajol',
    plot: 'A young woman on a Eurorail trip meets the man who will change everything.',
    duration: 320, swatch: YELLOW_GREEN, era: '90s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's9', song: 'Chaiyya Chaiyya', movie: 'Dil Se..', year: 1998,
    director: 'Mani Ratnam', cast: 'Shah Rukh Khan, Malaika Arora, Manisha Koirala',
    plot: 'A radio journalist becomes obsessed with a mysterious woman tied to an insurgency.',
    duration: 411, swatch: DARKPINK_GOLD, era: '90s', mood: 'Anthemic', popularity: 1,
  },
  {
    id: 's13', song: 'Pehla Nasha', movie: 'Jo Jeeta Wohi Sikander', year: 1992,
    director: 'Mansoor Khan', cast: 'Aamir Khan, Ayesha Jhulka, Pooja Bedi',
    plot: 'A college slacker grows up while training to win a cycling championship for his school.',
    duration: 285, swatch: PINK_GOLD, era: '90s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's14', song: 'Kuch Kuch Hota Hai', movie: 'Kuch Kuch Hota Hai', year: 1998,
    director: 'Karan Johar', cast: 'Shah Rukh Khan, Kajol, Rani Mukerji',
    plot: 'A widower’s daughter sets out to reunite him with his college best friend.',
    duration: 304, swatch: PINK_GOLD, era: '90s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's15', song: 'Dil To Pagal Hai', movie: 'Dil To Pagal Hai', year: 1997,
    director: 'Yash Chopra', cast: 'Shah Rukh Khan, Madhuri Dixit, Karisma Kapoor',
    plot: 'A dance-troupe director must choose between his fiery muse and a graceful newcomer.',
    duration: 327, swatch: PURPLE_TEAL, era: '90s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's16', song: 'Tip Tip Barsa Pani', movie: 'Mohra', year: 1994,
    director: 'Rajiv Rai', cast: 'Akshay Kumar, Raveena Tandon, Sunil Shetty',
    plot: 'A cop, a journalist, and a blind man uncover a vast criminal conspiracy.',
    duration: 312, swatch: ORANGE_GOLD, era: '90s', mood: 'Party', popularity: 2,
  },
  {
    id: 's17', song: 'Yeh Kaali Kaali Aankhen', movie: 'Baazigar', year: 1993,
    director: 'Abbas-Mustan', cast: 'Shah Rukh Khan, Kajol, Shilpa Shetty',
    plot: 'A son will burn through anyone to avenge what was taken from his family.',
    duration: 308, swatch: DARKPINK_GOLD, era: '90s', mood: 'Anthemic', popularity: 1,
  },
  {
    id: 's18', song: 'Hai Rama', movie: 'Rangeela', year: 1995,
    director: 'Ram Gopal Varma', cast: 'Aamir Khan, Urmila Matondkar, Jackie Shroff',
    plot: 'A movie-mad street kid and a star director both fall for the same Bombay dreamer.',
    duration: 271, swatch: PINK_GOLD, era: '90s', mood: 'Romantic', popularity: 2,
  },
  {
    id: 's19', song: 'O O Jaane Jaana', movie: 'Pyaar Kiya Toh Darna Kya', year: 1998,
    director: 'Sohail Khan', cast: 'Salman Khan, Kajol, Arbaaz Khan',
    plot: 'A college romance has to survive a brother’s wrath when the truth comes out.',
    duration: 296, swatch: PINK_PURPLE, era: '90s', mood: 'Romantic', popularity: 2,
  },

  // ── 2000s ────────────────────────────────────────────────────────────────
  {
    id: 's1', song: 'Bole Chudiyan', movie: 'Kabhi Khushi Kabhie Gham', year: 2001,
    director: 'Karan Johar', cast: 'Amitabh Bachchan, Shah Rukh Khan, Kajol, Hrithik Roshan',
    plot: 'A family torn apart by tradition and the heir who was disowned.',
    duration: 354, swatch: PINK_GOLD, era: '2000s', mood: 'Wedding', popularity: 1,
  },
  {
    id: 's4', song: 'Give Me Some Sunshine', movie: '3 Idiots', year: 2009,
    director: 'Rajkumar Hirani', cast: 'Aamir Khan, R. Madhavan, Sharman Joshi, Kareena Kapoor',
    plot: 'Two friends search for a long-lost classmate who changed their lives at engineering college.',
    duration: 252, swatch: GOLD_TEAL, era: '2000s', mood: 'Coming-of-age', popularity: 1,
  },
  {
    id: 's10', song: 'Tum Se Hi', movie: 'Jab We Met', year: 2007,
    director: 'Imtiaz Ali', cast: 'Shahid Kapoor, Kareena Kapoor',
    plot: 'A heartbroken businessman finds himself stuck with a chatty Punjabi girl on a train.',
    duration: 312, swatch: ORANGE_TEAL, era: '2000s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's12', song: 'Kal Ho Naa Ho', movie: 'Kal Ho Naa Ho', year: 2003,
    director: 'Nikkhil Advani', cast: 'Shah Rukh Khan, Preity Zinta, Saif Ali Khan',
    plot: 'A New York family is rescued by a charming stranger with a secret.',
    duration: 314, swatch: PURPLE_PINK, era: '2000s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's20', song: 'Suraj Hua Maddham', movie: 'Kabhi Khushi Kabhie Gham', year: 2001,
    director: 'Karan Johar', cast: 'Shah Rukh Khan, Kajol',
    plot: 'A family torn apart by tradition and the heir who was disowned.',
    duration: 432, swatch: DARKPINK_GOLD, era: '2000s', mood: 'Romantic', popularity: 2,
  },
  {
    id: 's21', song: 'Aankhon Mein Teri', movie: 'Om Shanti Om', year: 2007,
    director: 'Farah Khan', cast: 'Shah Rukh Khan, Deepika Padukone, Arjun Rampal',
    plot: 'A reborn extra returns to settle scores in the same Bombay film industry that wronged him.',
    duration: 318, swatch: PURPLE_TEAL, era: '2000s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's22', song: 'Dard E Disco', movie: 'Om Shanti Om', year: 2007,
    director: 'Farah Khan', cast: 'Shah Rukh Khan, Deepika Padukone',
    plot: 'A reborn extra returns to settle scores in the same Bombay film industry that wronged him.',
    duration: 252, swatch: PINK_PURPLE, era: '2000s', mood: 'Party', popularity: 1,
  },
  {
    id: 's23', song: 'Desi Girl', movie: 'Dostana', year: 2008,
    director: 'Tarun Mansukhani', cast: 'John Abraham, Abhishek Bachchan, Priyanka Chopra',
    plot: 'Two straight men pretend to be a couple to share a Miami apartment with their dream roommate.',
    duration: 274, swatch: PINK_GOLD, era: '2000s', mood: 'Party', popularity: 1,
  },
  {
    id: 's24', song: 'Kabhi Kabhi Aditi', movie: 'Jaane Tu Ya Jaane Na', year: 2008,
    director: 'Abbas Tyrewala', cast: 'Imran Khan, Genelia D’Souza',
    plot: 'Two best friends help each other find love only to realise the answer was sitting across the table.',
    duration: 257, swatch: GOLD_TEAL, era: '2000s', mood: 'Coming-of-age', popularity: 2,
  },
  {
    id: 's25', song: 'Iktara', movie: 'Wake Up Sid', year: 2009,
    director: 'Ayan Mukerji', cast: 'Ranbir Kapoor, Konkona Sen Sharma',
    plot: 'A spoilt Mumbai college kid moves in with an older woman from Calcutta and finally grows up.',
    duration: 271, swatch: PURPLE_PINK, era: '2000s', mood: 'Coming-of-age', popularity: 2,
  },
  {
    id: 's26', song: 'Roobaroo', movie: 'Rang De Basanti', year: 2006,
    director: 'Rakeysh Omprakash Mehra', cast: 'Aamir Khan, Siddharth, Atul Kulkarni, Soha Ali Khan',
    plot: 'Five college friends shoot a documentary about freedom fighters and end up living the story.',
    duration: 322, swatch: YELLOW_GREEN, era: '2000s', mood: 'Anthemic', popularity: 1,
  },
  {
    id: 's27', song: 'Jai Ho', movie: 'Slumdog Millionaire', year: 2008,
    director: 'Danny Boyle', cast: 'Dev Patel, Freida Pinto',
    plot: 'A Mumbai chai-wallah on a TV quiz show is suspected of cheating his way to the jackpot.',
    duration: 322, swatch: DARK_ORANGE, era: '2000s', mood: 'Anthemic', popularity: 1,
  },
  {
    id: 's28', song: 'Tum Mile', movie: 'Tum Mile', year: 2009,
    director: 'Kunal Deshmukh', cast: 'Emraan Hashmi, Soha Ali Khan',
    plot: 'Old lovers reunited on a plane to Mumbai — just as the 2005 floods hit the city.',
    duration: 281, swatch: PURPLE_TEAL, era: '2000s', mood: 'Romantic', popularity: 2,
  },

  // ── 2010s ────────────────────────────────────────────────────────────────
  {
    id: 's2', song: 'Tum Hi Ho', movie: 'Aashiqui 2', year: 2013,
    director: 'Mohit Suri', cast: 'Aditya Roy Kapur, Shraddha Kapoor',
    plot: 'A fading rockstar mentors a young singer; love and self-destruction follow.',
    duration: 263, swatch: PURPLE_TEAL, era: '2010s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's3', song: 'Senorita', movie: 'Zindagi Na Milegi Dobara', year: 2011,
    director: 'Zoya Akhtar', cast: 'Hrithik Roshan, Farhan Akhtar, Abhay Deol, Katrina Kaif',
    plot: 'Three friends take a bachelor road trip through Spain.',
    duration: 217, swatch: ORANGE_GOLD, era: '2010s', mood: 'Roadtrip', popularity: 2,
  },
  {
    id: 's5', song: 'Deewani Mastani', movie: 'Bajirao Mastani', year: 2015,
    director: 'Sanjay Leela Bhansali', cast: 'Ranveer Singh, Deepika Padukone, Priyanka Chopra',
    plot: 'A Maratha warrior falls for a Muslim princess against the will of his court.',
    duration: 363, swatch: DARKPINK_GOLD, era: '2010s', mood: 'Period', popularity: 1,
  },
  {
    id: 's7', song: 'Badtameez Dil', movie: 'Yeh Jawaani Hai Deewani', year: 2013,
    director: 'Ayan Mukerji', cast: 'Ranbir Kapoor, Deepika Padukone',
    plot: 'A wanderer and a bookish girl meet at a Manali trek and reunite a decade later.',
    duration: 256, swatch: PINK_PURPLE, era: '2010s', mood: 'Party', popularity: 1,
  },
  {
    id: 's8', song: 'Kun Faya Kun', movie: 'Rockstar', year: 2011,
    director: 'Imtiaz Ali', cast: 'Ranbir Kapoor, Nargis Fakhri',
    plot: 'A college kid becomes a tortured rockstar after losing the love of his life.',
    duration: 460, swatch: DARK_ORANGE, era: '2010s', mood: 'Sufi', popularity: 2,
  },
  {
    id: 's11', song: 'Ghoomar', movie: 'Padmaavat', year: 2018,
    director: 'Sanjay Leela Bhansali', cast: 'Deepika Padukone, Ranveer Singh, Shahid Kapoor',
    plot: 'A Rajput queen becomes the obsession of a Sultan who will burn empires to possess her.',
    duration: 246, swatch: DARKPINK_GOLD, era: '2010s', mood: 'Period', popularity: 1,
  },
  {
    id: 's29', song: 'Balam Pichkari', movie: 'Yeh Jawaani Hai Deewani', year: 2013,
    director: 'Ayan Mukerji', cast: 'Ranbir Kapoor, Deepika Padukone',
    plot: 'A wanderer and a bookish girl meet at a Manali trek and reunite a decade later.',
    duration: 269, swatch: ORANGE_GOLD, era: '2010s', mood: 'Party', popularity: 1,
  },
  {
    id: 's30', song: 'Kabira', movie: 'Yeh Jawaani Hai Deewani', year: 2013,
    director: 'Ayan Mukerji', cast: 'Ranbir Kapoor, Deepika Padukone',
    plot: 'A wanderer and a bookish girl meet at a Manali trek and reunite a decade later.',
    duration: 232, swatch: GOLD_TEAL, era: '2010s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's31', song: 'Ilahi', movie: 'Yeh Jawaani Hai Deewani', year: 2013,
    director: 'Ayan Mukerji', cast: 'Ranbir Kapoor, Deepika Padukone',
    plot: 'A wanderer and a bookish girl meet at a Manali trek and reunite a decade later.',
    duration: 248, swatch: ORANGE_TEAL, era: '2010s', mood: 'Coming-of-age', popularity: 2,
  },
  {
    id: 's32', song: 'Sadda Haq', movie: 'Rockstar', year: 2011,
    director: 'Imtiaz Ali', cast: 'Ranbir Kapoor, Nargis Fakhri',
    plot: 'A college kid becomes a tortured rockstar after losing the love of his life.',
    duration: 307, swatch: DARK_ORANGE, era: '2010s', mood: 'Anthemic', popularity: 1,
  },
  {
    id: 's33', song: 'Channa Mereya', movie: 'Ae Dil Hai Mushkil', year: 2016,
    director: 'Karan Johar', cast: 'Ranbir Kapoor, Anushka Sharma, Aishwarya Rai Bachchan',
    plot: 'An unrequited love that becomes the rest of a life.',
    duration: 286, swatch: PURPLE_TEAL, era: '2010s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's34', song: 'Ae Dil Hai Mushkil', movie: 'Ae Dil Hai Mushkil', year: 2016,
    director: 'Karan Johar', cast: 'Ranbir Kapoor, Anushka Sharma',
    plot: 'An unrequited love that becomes the rest of a life.',
    duration: 277, swatch: DARKPINK_GOLD, era: '2010s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's35', song: 'Bulleya', movie: 'Ae Dil Hai Mushkil', year: 2016,
    director: 'Karan Johar', cast: 'Ranbir Kapoor, Aishwarya Rai Bachchan',
    plot: 'An unrequited love that becomes the rest of a life.',
    duration: 263, swatch: DARK_ORANGE, era: '2010s', mood: 'Sufi', popularity: 1,
  },
  {
    id: 's36', song: 'Apna Time Aayega', movie: 'Gully Boy', year: 2019,
    director: 'Zoya Akhtar', cast: 'Ranveer Singh, Alia Bhatt, Siddhant Chaturvedi',
    plot: 'A Dharavi kid finds his voice in the underground rap battles of Mumbai.',
    duration: 213, swatch: YELLOW_GREEN, era: '2010s', mood: 'Anthemic', popularity: 1,
  },
  {
    id: 's37', song: 'Munni Badnaam Hui', movie: 'Dabangg', year: 2010,
    director: 'Abhinav Kashyap', cast: 'Salman Khan, Sonakshi Sinha, Malaika Arora',
    plot: 'A swaggering UP cop runs a town with his fists and a heart for his stepmother.',
    duration: 287, swatch: PINK_GOLD, era: '2010s', mood: 'Party', popularity: 1,
  },
  {
    id: 's38', song: 'Chikni Chameli', movie: 'Agneepath', year: 2012,
    director: 'Karan Malhotra', cast: 'Hrithik Roshan, Priyanka Chopra, Katrina Kaif',
    plot: 'A son returns to the village where his father was lynched, ready to burn it down.',
    duration: 261, swatch: ORANGE_GOLD, era: '2010s', mood: 'Party', popularity: 1,
  },
  {
    id: 's39', song: 'Sheila Ki Jawani', movie: 'Tees Maar Khan', year: 2010,
    director: 'Farah Khan', cast: 'Akshay Kumar, Katrina Kaif',
    plot: 'A con artist plans to rob a train hauling antique treasures with a Bollywood-shoot decoy.',
    duration: 290, swatch: PINK_PURPLE, era: '2010s', mood: 'Party', popularity: 1,
  },
  {
    id: 's40', song: 'Khwabon Ke Parindey', movie: 'Zindagi Na Milegi Dobara', year: 2011,
    director: 'Zoya Akhtar', cast: 'Hrithik Roshan, Farhan Akhtar, Abhay Deol',
    plot: 'Three friends take a bachelor road trip through Spain.',
    duration: 232, swatch: ORANGE_TEAL, era: '2010s', mood: 'Roadtrip', popularity: 2,
  },
  {
    id: 's41', song: 'Phir Se Ud Chala', movie: 'Rockstar', year: 2011,
    director: 'Imtiaz Ali', cast: 'Ranbir Kapoor',
    plot: 'A college kid becomes a tortured rockstar after losing the love of his life.',
    duration: 296, swatch: GOLD_TEAL, era: '2010s', mood: 'Roadtrip', popularity: 2,
  },

  // ── 2020s ────────────────────────────────────────────────────────────────
  {
    id: 's42', song: 'Kesariya', movie: 'Brahmastra', year: 2022,
    director: 'Ayan Mukerji', cast: 'Ranbir Kapoor, Alia Bhatt',
    plot: 'A young man discovers he wields the fire — and is the last hope against an awakening evil.',
    duration: 268, swatch: ORANGE_GOLD, era: '2020s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's43', song: 'Naatu Naatu', movie: 'RRR', year: 2022,
    director: 'S.S. Rajamouli', cast: 'N.T. Rama Rao Jr., Ram Charan, Alia Bhatt',
    plot: 'Two real-life Indian revolutionaries are reimagined as friends fighting the British Raj.',
    duration: 213, swatch: YELLOW_GREEN, era: '2020s', mood: 'Party', popularity: 1,
  },
  {
    id: 's44', song: 'Jhoome Jo Pathaan', movie: 'Pathaan', year: 2023,
    director: 'Siddharth Anand', cast: 'Shah Rukh Khan, Deepika Padukone, John Abraham',
    plot: 'A renegade Indian spy hunts down a rogue agent threatening a coordinated attack.',
    duration: 218, swatch: PINK_PURPLE, era: '2020s', mood: 'Party', popularity: 1,
  },
  {
    id: 's45', song: 'Raataan Lambiyan', movie: 'Shershaah', year: 2021,
    director: 'Vishnuvardhan', cast: 'Sidharth Malhotra, Kiara Advani',
    plot: 'The true story of Captain Vikram Batra, Kargil hero, and the love left behind.',
    duration: 233, swatch: GOLD_TEAL, era: '2020s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's46', song: 'Ranjha', movie: 'Shershaah', year: 2021,
    director: 'Vishnuvardhan', cast: 'Sidharth Malhotra, Kiara Advani',
    plot: 'The true story of Captain Vikram Batra, Kargil hero, and the love left behind.',
    duration: 242, swatch: DARKPINK_GOLD, era: '2020s', mood: 'Romantic', popularity: 1,
  },
  {
    id: 's47', song: 'Param Sundari', movie: 'Mimi', year: 2021,
    director: 'Laxman Utekar', cast: 'Kriti Sanon, Pankaj Tripathi',
    plot: 'A small-town dancer agrees to be a surrogate — then the foreign parents back out.',
    duration: 197, swatch: PINK_GOLD, era: '2020s', mood: 'Party', popularity: 2,
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
