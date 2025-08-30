// Mock movie data for the platform
export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  genre: string;
  duration: number;
  description: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  reviews: Review[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

import quantumDriftPoster from "@/assets/movie-quantum-drift.jpg";
import shadowProtocolPoster from "@/assets/movie-shadow-protocol.jpg";
import lastRealmPoster from "@/assets/movie-last-realm.jpg";

export const movies: Movie[] = [
  {
    id: 1,
    title: "Quantum Drift",
    posterUrl: quantumDriftPoster,
    rating: 8.4,
    year: 2024,
    genre: "Sci-Fi Thriller",
    duration: 127,
    description: "When a quantum physicist discovers a way to manipulate time, she must navigate parallel realities to prevent a catastrophic timeline collapse that threatens all existence.",
    director: "Sarah Chen",
    cast: ["Emma Stone", "Oscar Isaac", "Lupita Nyong'o", "Michael Shannon"],
    trailerUrl: "https://example.com/quantum-drift-trailer",
    reviews: [
      {
        id: 1,
        userId: 1,
        userName: "MovieBuff23",
        rating: 9,
        comment: "Absolutely mind-bending! The visual effects are stunning and the plot keeps you guessing until the very end. Emma Stone delivers an incredible performance.",
        date: "2024-03-15",
        helpful: 42
      },
      {
        id: 2,
        userId: 2,
        userName: "CinemaLover",
        rating: 8,
        comment: "Great sci-fi film with excellent cinematography. Some plot points could have been explained better, but overall a solid watch.",
        date: "2024-03-12",
        helpful: 23
      }
    ]
  },
  {
    id: 2,
    title: "Shadow Protocol",
    posterUrl: shadowProtocolPoster,
    rating: 7.8,
    year: 2024,
    genre: "Action Thriller",
    duration: 112,
    description: "A former CIA operative must expose a conspiracy within the agency while being hunted by his former colleagues in this high-octane thriller.",
    director: "Marcus Webb",
    cast: ["Idris Elba", "Charlize Theron", "John Boyega", "Tilda Swinton"],
    reviews: [
      {
        id: 3,
        userId: 3,
        userName: "ActionFan",
        rating: 8,
        comment: "Non-stop action from start to finish! Idris Elba is fantastic as always. The chase scenes are incredibly well choreographed.",
        date: "2024-03-10",
        helpful: 31
      }
    ]
  },
  {
    id: 3,
    title: "The Last Realm",
    posterUrl: lastRealmPoster,
    rating: 9.1,
    year: 2024,
    genre: "Fantasy Adventure",
    duration: 145,
    description: "In a world where magic is fading, a young mage must journey to the last magical realm to restore balance before darkness consumes everything.",
    director: "Elena Rodriguez",
    cast: ["Anya Taylor-Joy", "Dev Patel", "Saoirse Ronan", "Brian Cox"],
    reviews: [
      {
        id: 4,
        userId: 4,
        userName: "FantasyExplorer",
        rating: 10,
        comment: "This movie is a masterpiece! The world-building is incredible, and the magical effects are absolutely breathtaking. A must-watch for fantasy fans.",
        date: "2024-03-08",
        helpful: 67
      },
      {
        id: 5,
        userId: 5,
        userName: "MovieCritic99",
        rating: 9,
        comment: "Exceptional storytelling with beautiful cinematography. The character development is top-notch and the ending is both satisfying and emotional.",
        date: "2024-03-05",
        helpful: 45
      }
    ]
  },
  {
    id: 4,
    title: "Digital Uprising",
    posterUrl: quantumDriftPoster, // Reusing for now
    rating: 7.2,
    year: 2023,
    genre: "Cyberpunk",
    duration: 98,
    description: "In a dystopian future, hackers fight against an oppressive digital surveillance state.",
    director: "Alex Kim",
    cast: ["Zendaya", "Ryan Gosling", "Mahershala Ali"],
    reviews: []
  },
  {
    id: 5,
    title: "Ocean's Heart",
    posterUrl: shadowProtocolPoster, // Reusing for now
    rating: 8.7,
    year: 2023,
    genre: "Drama",
    duration: 134,
    description: "A touching story about family, forgiveness, and finding hope in the darkest of times.",
    director: "Sofia Nakamura",
    cast: ["Viola Davis", "Anthony Hopkins", "Lupita Nyong'o"],
    reviews: []
  },
  {
    id: 6,
    title: "Velocity",
    posterUrl: lastRealmPoster, // Reusing for now
    rating: 6.9,
    year: 2023,
    genre: "Racing",
    duration: 106,
    description: "Underground street racing meets high-stakes heist in this adrenaline-fueled adventure.",
    director: "James Rodriguez",
    cast: ["Michael B. Jordan", "Ana de Armas", "John Cho"],
    reviews: []
  }
];

export const featuredMovies = movies.slice(0, 3);
export const trendingMovies = movies.slice(2, 6);