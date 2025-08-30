import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Calendar, Play, Heart, Bookmark, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { movies } from "@/data/movies";

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isWritingReview, setIsWritingReview] = useState(false);

  const movie = movies.find(m => m.id === parseInt(id || "0"));

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
          <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist.</p>
          <Link to="/movies">
            <Button>Browse Movies</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmitReview = () => {
    if (newReviewRating > 0 && newReviewComment.trim()) {
      // In a real app, this would make an API call
      console.log("New review:", { rating: newReviewRating, comment: newReviewComment });
      setNewReviewRating(0);
      setNewReviewComment("");
      setIsWritingReview(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, interactive = false }: { rating: number; onRatingChange?: (rating: number) => void; interactive?: boolean }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? "fill-cinema-gold text-cinema-gold" 
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:text-cinema-gold" : ""}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/movies">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Movies
          </Button>
        </Link>
      </div>

      {/* Movie Header */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              </Card>
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-cinema-gold text-cinema-gold" />
                    <span className="text-2xl font-bold text-foreground">{movie.rating}</span>
                    <span>({movie.reviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{movie.duration} min</span>
                  </div>
                  <div className="bg-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
                    {movie.genre}
                  </div>
                </div>

                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {movie.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Director: </span>
                    <span className="text-muted-foreground">{movie.director}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Cast: </span>
                    <span className="text-muted-foreground">{movie.cast.join(", ")}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  {movie.trailerUrl && (
                    <Button size="lg" className="px-8">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Trailer
                    </Button>
                  )}
                  <Button variant="outline" size="lg">
                    <Bookmark className="mr-2 h-5 w-5" />
                    Add to Watchlist
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    Favorite
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Write Review */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Write a Review</h3>
              
              {!isWritingReview ? (
                <Button 
                  onClick={() => setIsWritingReview(true)}
                  className="w-full"
                >
                  Write Review
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <StarRating 
                      rating={newReviewRating} 
                      onRatingChange={setNewReviewRating}
                      interactive={true}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Review</label>
                    <Textarea
                      placeholder="Share your thoughts about this movie..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={newReviewRating === 0 || !newReviewComment.trim()}
                      className="flex-1"
                    >
                      Submit
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsWritingReview(false);
                        setNewReviewRating(0);
                        setNewReviewComment("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-6">
              Reviews ({movie.reviews.length})
            </h3>
            
            {movie.reviews.length > 0 ? (
              <div className="space-y-6">
                {movie.reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold">{review.userName}</h4>
                            <StarRating rating={review.rating} />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 leading-relaxed">
                          {review.comment}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <button className="hover:text-foreground transition-colors">
                            👍 Helpful ({review.helpful})
                          </button>
                          <button className="hover:text-foreground transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">No reviews yet</h4>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your thoughts about this movie!
                </p>
                <Button onClick={() => setIsWritingReview(true)}>
                  Write the First Review
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;