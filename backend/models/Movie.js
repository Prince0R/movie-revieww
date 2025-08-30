const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  originalTitle: {
    type: String,
    trim: true
  },
  genre: [{
    type: String,
    required: [true, 'At least one genre is required'],
    enum: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western']
  }],
  releaseYear: {
    type: Number,
    required: [true, 'Release year is required'],
    min: [1888, 'Release year cannot be before 1888'],
    max: [new Date().getFullYear() + 5, 'Release year cannot be more than 5 years in the future']
  },
  releaseDate: {
    type: Date
  },
  director: {
    type: String,
    required: [true, 'Director is required'],
    trim: true
  },
  cast: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    character: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  synopsis: {
    type: String,
    required: [true, 'Synopsis is required'],
    maxlength: [2000, 'Synopsis cannot exceed 2000 characters']
  },
  posterUrl: {
    type: String,
    required: [true, 'Poster URL is required']
  },
  backdropUrl: {
    type: String
  },
  trailerUrl: {
    type: String
  },
  runtime: {
    type: Number,
    required: [true, 'Runtime is required'],
    min: [1, 'Runtime must be at least 1 minute']
  },
  language: {
    type: String,
    default: 'English'
  },
  country: {
    type: String,
    default: 'United States'
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  boxOffice: {
    type: Number,
    min: [0, 'Box office cannot be negative']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [10, 'Rating cannot exceed 10']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    },
    distribution: {
      '1': { type: Number, default: 0 },
      '2': { type: Number, default: 0 },
      '3': { type: Number, default: 0 },
      '4': { type: Number, default: 0 },
      '5': { type: Number, default: 0 }
    }
  },
  mpaaRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'Not Rated'],
    default: 'Not Rated'
  },
  awards: [{
    name: String,
    category: String,
    year: Number,
    won: Boolean
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted runtime
movieSchema.virtual('formattedRuntime').get(function() {
  const hours = Math.floor(this.runtime / 60);
  const minutes = this.runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for formatted budget
movieSchema.virtual('formattedBudget').get(function() {
  if (!this.budget) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(this.budget);
});

// Virtual for formatted box office
movieSchema.virtual('formattedBoxOffice').get(function() {
  if (!this.boxOffice) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(this.boxOffice);
});

// Virtual for age of movie
movieSchema.virtual('age').get(function() {
  const currentYear = new Date().getFullYear();
  return currentYear - this.releaseYear;
});

// Indexes for better query performance
movieSchema.index({ title: 'text', synopsis: 'text', 'cast.name': 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ 'rating.average': -1 });
movieSchema.index({ 'rating.count': -1 });
movieSchema.index({ isActive: 1 });

// Method to update average rating
movieSchema.methods.updateRating = function() {
  const Review = mongoose.model('Review');
  
  return Review.aggregate([
    { $match: { movie: this._id } },
    { $group: { 
      _id: null, 
      averageRating: { $avg: '$rating' },
      count: { $sum: 1 },
      distribution: { $push: '$rating' }
    }}
  ]).then(result => {
    if (result.length > 0) {
      const { averageRating, count, distribution } = result[0];
      
      // Calculate rating distribution
      const dist = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      distribution.forEach(rating => {
        const key = Math.floor(rating).toString();
        if (dist[key] !== undefined) dist[key]++;
      });
      
      this.rating = {
        average: Math.round(averageRating * 10) / 10,
        count,
        distribution: dist
      };
    } else {
      this.rating = { average: 0, count: 0, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
    }
    
    return this.save();
  });
};

// Static method to find movies by genre
movieSchema.statics.findByGenre = function(genre) {
  return this.find({ genre: genre, isActive: true });
};

// Static method to find top rated movies
movieSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    'rating.count': { $gte: 5 } 
  })
  .sort({ 'rating.average': -1 })
  .limit(limit);
};

// Static method to find recent releases
movieSchema.statics.findRecentReleases = function(limit = 10) {
  const currentYear = new Date().getFullYear();
  return this.find({ 
    releaseYear: { $gte: currentYear - 1 },
    isActive: true 
  })
  .sort({ releaseYear: -1, 'rating.average': -1 })
  .limit(limit);
};

module.exports = mongoose.model('Movie', movieSchema);
