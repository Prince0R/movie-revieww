import { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import MovieCard from "@/components/MovieCard";
import { movies } from "@/data/movies";

const MoviesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extract unique genres and years
  const genres = ["all", ...Array.from(new Set(movies.map(movie => movie.genre)))];
  const years = ["all", ...Array.from(new Set(movies.map(movie => movie.year.toString()))).sort().reverse()];

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let filtered = movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.director.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
      const matchesYear = selectedYear === "all" || movie.year.toString() === selectedYear;
      
      return matchesSearch && matchesGenre && matchesYear;
    });

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.year - a.year;
        case "title":
          return a.title.localeCompare(b.title);
        case "duration":
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedGenre, selectedYear, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Movies</h1>
          <p className="text-muted-foreground text-lg">
            Discover and explore our collection of {movies.length} movies
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search movies, directors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Genre Filter */}
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre === "all" ? "All Genres" : genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year === "all" ? "All Years" : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMovies.length} of {movies.length} movies
          </p>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
              : "grid-cols-1"
          }`}>
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.posterUrl}
                rating={movie.rating}
                year={movie.year}
                genre={movie.genre}
                duration={movie.duration}
                description={viewMode === "list" ? movie.description : undefined}
                variant={viewMode === "list" ? "featured" : "default"}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedGenre("all");
              setSelectedYear("all");
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;