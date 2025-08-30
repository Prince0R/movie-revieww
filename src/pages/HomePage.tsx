import { Link } from "react-router-dom";
import { Play, TrendingUp, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MovieCard from "@/components/MovieCard";
import { featuredMovies, trendingMovies } from "@/data/movies";
import heroBanner from "@/assets/hero-banner.jpg";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Discover Cinema
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Your ultimate destination for movie reviews, ratings, and cinematic discussions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3 bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-5 w-5" />
              Explore Movies
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white/20 text-white hover:bg-white/10">
              Write a Review
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Featured Movies */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-cinema-gold" />
              <h2 className="text-3xl font-bold">Featured Movies</h2>
            </div>
            <Link to="/movies">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.posterUrl}
                rating={movie.rating}
                year={movie.year}
                genre={movie.genre}
                duration={movie.duration}
                description={movie.description}
                variant="featured"
              />
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-cinema-red" />
              <h2 className="text-3xl font-bold">Trending Now</h2>
            </div>
            <Link to="/movies">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.posterUrl}
                rating={movie.rating}
                year={movie.year}
                genre={movie.genre}
                duration={movie.duration}
              />
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-gradient-card">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Movies in Database</div>
            </Card>
            <Card className="p-8 text-center bg-gradient-card">
              <div className="text-4xl font-bold text-cinema-gold mb-2">25,000+</div>
              <div className="text-muted-foreground">User Reviews</div>
            </Card>
            <Card className="p-8 text-center bg-gradient-card">
              <div className="text-4xl font-bold text-cinema-red mb-2">5,000+</div>
              <div className="text-muted-foreground">Active Users</div>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16">
          <Card className="max-w-2xl mx-auto p-12 bg-gradient-card">
            <h3 className="text-3xl font-bold mb-4">Join the Community</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Share your thoughts, discover new films, and connect with fellow movie enthusiasts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Start Reviewing
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Browse Movies
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HomePage;