const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['plan_to_watch', 'watching', 'completed', 'dropped'],
    default: 'plan_to_watch'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateWatched: {
    type: Date
  },
  rewatchCount: {
    type: Number,
    default: 0,
    min: [0, 'Rewatch count cannot be negative']
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time since added
watchlistSchema.virtual('timeSinceAdded').get(function() {
  const now = new Date();
  const diffInDays = Math.floor((now - this.dateAdded) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
});

// Virtual for watch status color
watchlistSchema.virtual('statusColor').get(function() {
  const colors = {
    'plan_to_watch': 'blue',
    'watching': 'yellow',
    'completed': 'green',
    'dropped': 'red'
  };
  return colors[this.status] || 'gray';
});

// Indexes for better query performance
watchlistSchema.index({ user: 1, movie: 1 }, { unique: true }); // One entry per user per movie
watchlistSchema.index({ user: 1, status: 1 });
watchlistSchema.index({ user: 1, dateAdded: -1 });
watchlistSchema.index({ user: 1, priority: 1 });
watchlistSchema.index({ movie: 1, status: 1 });
watchlistSchema.index({ isPublic: 1 });

// Pre-save middleware to update date watched
watchlistSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.dateWatched) {
    this.dateWatched = new Date();
  }
  next();
});

// Method to mark as watched
watchlistSchema.methods.markAsWatched = function() {
  this.status = 'completed';
  this.dateWatched = new Date();
  return this.save();
};

// Method to mark as watching
watchlistSchema.methods.markAsWatching = function() {
  this.status = 'watching';
  return this.save();
};

// Method to mark as dropped
watchlistSchema.methods.markAsDropped = function() {
  this.status = 'dropped';
  return this.save();
};

// Method to increment rewatch count
watchlistSchema.methods.incrementRewatch = function() {
  this.rewatchCount += 1;
  this.dateWatched = new Date();
  return this.save();
};

// Method to update priority
watchlistSchema.methods.updatePriority = function(priority) {
  this.priority = priority;
  return this.save();
};

// Static method to find user's watchlist
watchlistSchema.statics.findByUser = function(userId, options = {}) {
  const { 
    status, 
    page = 1, 
    limit = 20, 
    sort = 'dateAdded', 
    order = 'desc' 
  } = options;
  
  const query = { user: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('movie', 'title posterUrl releaseYear genre runtime rating')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to find watchlist by status
watchlistSchema.statics.findByStatus = function(userId, status, options = {}) {
  const { page = 1, limit = 20, sort = 'dateAdded', order = 'desc' } = options;
  
  return this.find({ user: userId, status })
    .populate('movie', 'title posterUrl releaseYear genre runtime rating')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to find watchlist by priority
watchlistSchema.statics.findByPriority = function(userId, priority, options = {}) {
  const { page = 1, limit = 20, sort = 'dateAdded', order = 'desc' } = options;
  
  return this.find({ user: userId, priority })
    .populate('movie', 'title posterUrl releaseYear genre runtime rating')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get watchlist statistics
watchlistSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }},
    { $group: {
      _id: null,
      total: { $sum: '$count' },
      statuses: { $push: { status: '$_id', count: '$count' } }
    }}
  ]);
};

// Static method to find popular movies in watchlists
watchlistSchema.statics.findPopularInWatchlists = function(limit = 10) {
  return this.aggregate([
    { $match: { isPublic: true } },
    { $group: {
      _id: '$movie',
      count: { $sum: 1 },
      statuses: { $push: '$status' }
    }},
    { $sort: { count: -1 } },
    { $limit: limit },
    { $lookup: {
      from: 'movies',
      localField: '_id',
      foreignField: '_id',
      as: 'movie'
    }},
    { $unwind: '$movie' },
    { $project: {
      movie: 1,
      watchlistCount: '$count',
      statuses: 1
    }}
  ]);
};

module.exports = mongoose.model('Watchlist', watchlistSchema);
