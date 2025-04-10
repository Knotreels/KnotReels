// Logo & UI
export const NETFLIX_LOGO_URL = "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico";
export const NETFLIX_LOGO_TEXT_URL = "https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png";

export const HERO_BILLBOARD_IMAGES = [
  "https://images.unsplash.com/photo-1688372946673-8fe7f4ca3afa?q=80&w=1932&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1708607314119-a5eda731429f?q=80&w=1932&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599003037586-4ff1f8004d35?q=80&w=1971&auto=format&fit=crop",
];

// Nav & Footer
export const NAV_LINKS = [
  { name: "Home", href: "/browse" },
  { name: "TV Shows", href: "/browse/tv" },
  { name: "Movies", href: "/browse/movies" },
  { name: "New & Popular", href: "/browse/latest" },
  { name: "My List", href: "/browse/my-list" },
];

export const FOOTER_LINKS = [
  { name: "FAQ", href: "#" },
  { name: "Help Center", href: "#" },
  { name: "Account", href: "#" },
  { name: "Media Center", href: "#" },
  { name: "Investor Relations", href: "#" },
  { name: "Jobs", href: "#" },
  { name: "Ways to Watch", href: "#" },
  { name: "Terms of Use", href: "#" },
  { name: "Privacy", href: "#" },
  { name: "Cookie Preferences", href: "#" },
  { name: "Corporate Information", href: "#" },
  { name: "Contact Us", href: "#" },
  { name: "Speed Test", href: "#" },
  { name: "Legal Notices", href: "#" },
  { name: "Only on Netflix", href: "#" },
];

// Avatars
export const PROFILE_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
  "https://ih0.redbubble.net/image.618427277.3222/flat,1000x1000,075,f.u2.jpg",
  "https://ih0.redbubble.net/image.618379802.1473/flat,1000x1000,075,f.u2.jpg",
  "https://ih0.redbubble.net/image.618410871.2644/flat,1000x1000,075,f.u2.jpg",
  "https://ih0.redbubble.net/image.618405415.2473/flat,1000x1000,075,f.u2.jpg",
];

// Types
export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
};

// Genres
export const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  
];

// 🔥 Boosted Creators
export const BOOSTED_CREATORS = [
  {
    id: 'kr1',
    title: 'NeoVision',
    thumbnail: '/creators/neovision.jpg',
    description: 'AI-driven cinematic masterworks.',
  },
  {
    id: 'kr2',
    title: 'Jane AI',
    thumbnail: '/creators/jane-ai.jpg',
    description: 'Drama meets technology.',
  },
  {
    id: 'kr3',
    title: 'FlickForge',
    thumbnail: '/creators/flickforge.jpg',
    description: 'Shorts with an emotional punch.',
  },
];

// 🎥 Categories
// constants.ts
export const CATEGORIES = [
  
  {
    title: "Filmic",
    thumbnail: "/categories/filmics.jpg",
    href: "/category/filmics",
  },
  {
    title: "Animation",
    thumbnail: "/categories/animation.jpg",
    href: "/category/animation",
  },
  {
    title: "Horror",
    thumbnail: "/categories/horror.jpg",
    href: "/category/horror",
  },
  {
    title: "Fantasy",
    thumbnail: "/categories/fantasy.jpg",
    href: "/category/fantasy",
  }, 
  {
    title: "Anime",
    thumbnail: "/categories/anime.jpg",
    href: "/category/anime",
  },
  {
    title: "Neon-Noir",
    thumbnail: "/categories/neon-noir.jpg",
    href: "/category/neon-noir",
  },
  {
    title: "RetroVision",
    thumbnail: "/categories/retrovision.jpg",
    href: "/category/retrovision",
  },
  {
    title: "Action",
    thumbnail: "/categories/action.jpg",
    href: "/category/action",
  },
  {
    title: "Mythology",
    thumbnail: "/categories/mythology.jpg",
    href: "/category/mythology",
  },
  {
    title: "History",
    thumbnail: "/categories/history.jpg",
    href: "/category/history",
  },
  {
    title: "Ai Novels",
    thumbnail: "/categories/ai-novels.jpg",
    href: "/category/ai-novels",
  },
  {
    title: "Music",
    thumbnail: "/categories/music.jpg",
    href: "/category/music",
  },
];
    

// Sample shows
export const SAMPLE_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Stranger Things",
    overview: "When a young boy vanishes...",
    poster_path: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    release_date: "2016-07-15",
    genre_ids: [18, 9648, 10765],
    vote_average: 8.6
  },
  // ... other SAMPLE_MOVIES
];

export const TRENDING_NOW = SAMPLE_MOVIES;
export const POPULAR_ON_NETFLIX = [...SAMPLE_MOVIES].reverse();
export const TOP_PICKS = SAMPLE_MOVIES.slice(2, 6).concat(SAMPLE_MOVIES.slice(0, 2));
export const AWARD_WINNING_TV = SAMPLE_MOVIES.slice(1, 5).concat(SAMPLE_MOVIES.slice(0, 1));
