const express = require('express');
const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');
const { validateWatchlist, validateId } = require('../middleware/validation');

const router = express.Router();

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sort = 'dateAdded', 
      order = 'desc' 
    } = req.query;

    const watchlist = await Watchlist.findByUser(req.user._id, { 
      status, 
      page, 
      limit, 
      sort, 
      order 
    });

    res.json({
      error: false,
      data: {
        watchlist: watchlist.reviews || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((watchlist.total || 0) / parseInt(limit)),
          total: watchlist.total || 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching watchlist'
    });
  }
});

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
router.post('/', protect, validateWatchlist, async (req, res) => {
  try {
    const { movieId, status = 'plan_to_watch', priority = 'medium', notes, isPublic = true } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: true,
        message: 'Movie not found'
      });
    }

    // Check if movie is already in watchlist
    const existingEntry = await Watchlist.findOne({ user: req.user._id, movie: movieId });
    if (existingEntry) {
      return res.status(400).json({
        error: true,
        message: 'Movie is already in your watchlist'
      });
    }

    // Create watchlist entry
    const watchlistEntry = await Watchlist.create({
      user: req.user._id,
      movie: movieId,
      status,
      priority,
      notes,
      isPublic
    });

    // Populate movie info
    await watchlistEntry.populate('movie', 'title posterUrl releaseYear genre runtime rating');

    res.status(201).json({
      error: false,
      message: 'Movie added to watchlist successfully',
      data: { watchlistEntry }
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while adding movie to watchlist'
    });
  }
});

// @desc    Update watchlist entry
// @route   PUT /api/watchlist/:id
// @access  Private
router.put('/:id', protect, validateId, validateWatchlist, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findById(req.params.id);

    if (!watchlistEntry) {
      return res.status(404).json({
        error: true,
        message: 'Watchlist entry not found'
      });
    }

    // Check if user owns this watchlist entry
    if (watchlistEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only modify your own watchlist entries'
      });
    }

    // Update entry
    const updatedEntry = await Watchlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('movie', 'title posterUrl releaseYear genre runtime rating');

    res.json({
      error: false,
      message: 'Watchlist entry updated successfully',
      data: { watchlistEntry: updatedEntry }
    });
  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while updating watchlist entry'
    });
  }
});

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
router.delete('/:id', protect, validateId, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findById(req.params.id);

    if (!watchlistEntry) {
      return res.status(404).json({
        error: true,
        message: 'Watchlist entry not found'
      });
    }

    // Check if user owns this watchlist entry
    if (watchlistEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only remove your own watchlist entries'
      });
    }

    // Remove entry
    await Watchlist.findByIdAndDelete(req.params.id);

    res.json({
      error: false,
      message: 'Movie removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while removing movie from watchlist'
    });
  }
});

// @desc    Mark movie as watched
// @route   PUT /api/watchlist/:id/watched
// @access  Private
router.put('/:id/watched', protect, validateId, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findById(req.params.id);

    if (!watchlistEntry) {
      return res.status(404).json({
        error: true,
        message: 'Watchlist entry not found'
      });
    }

    // Check if user owns this watchlist entry
    if (watchlistEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only modify your own watchlist entries'
      });
    }

    // Mark as watched
    await watchlistEntry.markAsWatched();

    res.json({
      error: false,
      message: 'Movie marked as watched successfully',
      data: { watchlistEntry }
    });
  } catch (error) {
    console.error('Mark as watched error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while marking movie as watched'
    });
  }
});

// @desc    Mark movie as watching
// @route   PUT /api/watchlist/:id/watching
// @access  Private
router.put('/:id/watching', protect, validateId, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findById(req.params.id);

    if (!watchlistEntry) {
      return res.status(404).json({
        error: true,
        message: 'Watchlist entry not found'
      });
    }

    // Check if user owns this watchlist entry
    if (watchlistEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only modify your own watchlist entries'
      });
    }

    // Mark as watching
    await watchlistEntry.markAsWatching();

    res.json({
      error: false,
      message: 'Movie marked as watching successfully',
      data: { watchlistEntry }
    });
  } catch (error) {
    console.error('Mark as watching error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while marking movie as watching'
    });
  }
});

// @desc    Mark movie as dropped
// @route   PUT /api/watchlist/:id/dropped
// @access  Private
router.put('/:id/dropped', protect, validateId, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findById(req.params.id);

    if (!watchlistEntry) {
      return res.status(404).json({
        error: true,
        message: 'Watchlist entry not found'
      });
    }

    // Check if user owns this watchlist entry
    if (watchlistEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only modify your own watchlist entries'
      });
    }

    // Mark as dropped
    await watchlistEntry.markAsDropped();

    res.json({
      error: false,
      message: 'Movie marked as dropped successfully',
      data: { watchlistEntry }
    });
  } catch (error) {
    console.error('Mark as dropped error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while marking movie as dropped'
    });
  }
});

// @desc    Increment rewatch count
// @route   PUT /api/watchlist/:id/rewatch
// @access  Private
router.put('/:id/rewatch', protect, validateId, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findById(req.params.id);

    if (!watchlistEntry) {
      return res.status(404).json({
        error: true,
        message: 'Watchlist entry not found'
      });
    }

    // Check if user owns this watchlist entry
    if (watchlistEntry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only modify your own watchlist entries'
      });
    }

    // Increment rewatch count
    await watchlistEntry.incrementRewatch();

    res.json({
      error: false,
      message: 'Rewatch count incremented successfully',
      data: { watchlistEntry }
    });
  } catch (error) {
    console.error('Increment rewatch error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while incrementing rewatch count'
    });
  }
});

// @desc    Get watchlist by status
// @route   GET /api/watchlist/status/:status
// @access  Private
router.get('/status/:status', protect, async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 20, sort = 'dateAdded', order = 'desc' } = req.query;

    const watchlist = await Watchlist.findByStatus(req.user._id, status, { page, limit, sort, order });

    res.json({
      error: false,
      data: {
        watchlist: watchlist.reviews || [],
        status,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((watchlist.total || 0) / parseInt(limit)),
          total: watchlist.total || 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get watchlist by status error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching watchlist by status'
    });
  }
});

// @desc    Get watchlist by priority
// @route   GET /api/watchlist/priority/:priority
// @access  Private
router.get('/priority/:priority', protect, async (req, res) => {
  try {
    const { priority } = req.params;
    const { page = 1, limit = 20, sort = 'dateAdded', order = 'desc' } = req.query;

    const watchlist = await Watchlist.findByPriority(req.user._id, priority, { page, limit, sort, order });

    res.json({
      error: false,
      data: {
        watchlist: watchlist.reviews || [],
        priority,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((watchlist.total || 0) / parseInt(limit)),
          total: watchlist.total || 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get watchlist by priority error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching watchlist by priority'
    });
  }
});

// @desc    Get watchlist statistics
// @route   GET /api/watchlist/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Watchlist.getUserStats(req.user._id);

    res.json({
      error: false,
      data: { stats: stats[0] || { total: 0, statuses: [] } }
    });
  } catch (error) {
    console.error('Get watchlist stats error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching watchlist statistics'
    });
  }
});

// @desc    Get popular movies in watchlists
// @route   GET /api/watchlist/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularMovies = await Watchlist.findPopularInWatchlists(parseInt(limit));

    res.json({
      error: false,
      data: { movies: popularMovies }
    });
  } catch (error) {
    console.error('Get popular watchlist movies error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching popular watchlist movies'
    });
  }
});

module.exports = router;
