import { Link } from "react-router-dom";
import { Star, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  genre: string;
  duration?: number;
  description?: string;
  variant?: "default" | "featured";
}

const MovieCard = ({ 
  id, 
  title, 
  posterUrl, 
  rating, 
  year, 
  genre, 
  duration, 
  description,
  variant = "default" 
}: MovieCardProps) => {
  const isFeatured = variant === "featured";
  
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow ${
      isFeatured ? "h-96" : "h-80"
    }`}>
      <Link to={`/movie/${id}`} className="block h-full">
        <div className="relative h-full">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="space-y-2">
              <h3 className={`font-bold ${isFeatured ? "text-xl" : "text-lg"} line-clamp-2`}>
                {title}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-cinema-gold text-cinema-gold" />
                  <span>{rating.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{year}</span>
                </div>
                
                {duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{duration}m</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-full w-fit">
                {genre}
              </div>
              
              {description && isFeatured && (
                <p className="text-sm text-gray-200 line-clamp-3 mt-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="h-3 w-3 fill-cinema-gold text-cinema-gold" />
            <span className="text-xs text-white font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default MovieCard;