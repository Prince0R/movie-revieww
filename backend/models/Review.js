const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [2000, 'Review comment cannot exceed 2000 characters']
  },
  helpful: {
    count: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative']
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  spoiler: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time ago
reviewSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
});

// Indexes for better query performance
reviewSchema.index({ user: 1, movie: 1 }, { unique: true }); // One review per user per movie
reviewSchema.index({ movie: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ 'helpful.count': -1 });
reviewSchema.index({ isActive: 1 });

// Pre-save middleware to update movie rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating')) {
    try {
      const Movie = mongoose.model('Movie');
      const movie = await Movie.findById(this.movie);
      if (movie) {
        await movie.updateRating();
      }
    } catch (error) {
      console.error('Error updating movie rating:', error);
    }
  }
  next();
});

// Pre-remove middleware to update movie rating
reviewSchema.pre('remove', async function(next) {
  try {
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(this.movie);
    if (movie) {
      await movie.updateRating();
    }
  } catch (error) {
    console.error('Error updating movie rating:', error);
  }
  next();
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = function(userId) {
  const userIndex = this.helpful.users.indexOf(userId);
  if (userIndex > -1) {
    this.helpful.users.splice(userIndex, 1);
    this.helpful.count -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if user marked review as helpful
reviewSchema.methods.isHelpfulByUser = function(userId) {
  return this.helpful.users.includes(userId);
};

// Static method to find reviews by movie
reviewSchema.statics.findByMovie = function(movieId, options = {}) {
  const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
  
  return this.find({ movie: movieId, isActive: true })
    .populate('user', 'username profilePicture')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to find reviews by user
reviewSchema.statics.findByUser = function(userId, options = {}) {
  const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = options;
  
  return this.find({ user: userId, isActive: true })
    .populate('movie', 'title posterUrl releaseYear genre')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to find top helpful reviews
reviewSchema.statics.findTopHelpful = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('user', 'username profilePicture')
    .populate('movie', 'title posterUrl')
    .sort({ 'helpful.count': -1, createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
