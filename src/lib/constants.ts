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
  views: number;
  mediaUrl: boolean;
  tips: number;
  userId: any;
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  genre_ids?: number[];
  uid?: string;
  username?: string;
  vote_average?: number;
  href?: string;
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
    slug: "filmic",
    thumbnail: "/categories/filmics.jpg",
  },
  {
    title: "Animation",
    slug: "animation",
    thumbnail: "/categories/animation.jpg",
  },
  {
    title: "Horror",
    slug: "horror",
    thumbnail: "/categories/horror.jpg",
  },
  {
    title: "Fantasy",
    slug: "fantasy",
    thumbnail: "/categories/fantasy.jpg",
  }, 
  {
    title: "Anime",
    slug: "anime",
    thumbnail: "/categories/anime.jpg",
  },
  {
    title: "Neon-Noir",
    slug: "neon-noir",
    thumbnail: "/categories/neon-noir.jpg",
  },
  {
    title: "RetroVision",
    slug: "retrovision",
    thumbnail: "/categories/retrovision.jpg",
  },
  {
    title: "Action",
    slug: "action",
    thumbnail: "/categories/action.jpg",
  },
  {
    title: "Mythology",
    slug: "mythology",
    thumbnail: "/categories/mythology.jpg",
  },
  {
    title: "History",
    slug: "history",
    thumbnail: "/categories/history.jpg",
  },
  {
    title: "Ai Novels",
    slug: "ai-novels",
    thumbnail: "/categories/ai-novels.jpg",
  },
  {
    title: "Music",
    slug: "music",
    thumbnail: "/categories/music.jpg",
  },
];

    