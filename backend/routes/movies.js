const express = require('express');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const { 
  validateMovie, 
  validatePagination, 
  validateMovieSearch,
  validateId 
} = require('../middleware/validation');

const router = express.Router();

// @desc    Get all movies with pagination and filtering
// @route   GET /api/movies
// @access  Public
router.get('/', validatePagination, validateMovieSearch, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      q,
      genre,
      year,
      minRating,
      maxRating,
      director
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Genre filter
    if (genre) {
      query.genre = genre;
    }

    // Year filter
    if (year) {
      query.releaseYear = parseInt(year);
    }

    // Rating range filter
    if (minRating || maxRating) {
      query['rating.average'] = {};
      if (minRating) query['rating.average'].$gte = parseFloat(minRating);
      if (maxRating) query['rating.average'].$lte = parseFloat(maxRating);
    }

    // Director filter
    if (director) {
      query.director = { $regex: director, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Execute query
    const movies = await Movie.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Movie.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      error: false,
      data: {
        movies,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching movies'
    });
  }
});

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', validateId, optionalAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('addedBy', 'username profilePicture');

    if (!movie) {
      return res.status(404).json({
        error: true,
        message: 'Movie not found'
      });
    }

    if (!movie.isActive) {
      return res.status(404).json({
        error: true,
        message: 'Movie not found'
      });
    }

    // Get reviews for this movie
    const reviews = await Review.findByMovie(req.params.id, { page: 1, limit: 5 });

    // Check if user has reviewed this movie
    let userReview = null;
    if (req.user) {
      userReview = await Review.findOne({ user: req.user._id, movie: req.params.id });
    }

    res.json({
      error: false,
      data: {
        movie,
        reviews: reviews.reviews || [],
        userReview,
        reviewCount: reviews.total || 0
      }
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching movie'
    });
  }
});

// @desc    Create new movie (admin only)
// @route   POST /api/movies
// @access  Private/Admin
router.post('/', protect, admin, validateMovie, async (req, res) => {
  try {
    const movieData = {
      ...req.body,
      addedBy: req.user._id
    };

    const movie = await Movie.create(movieData);

    res.status(201).json({
      error: false,
      message: 'Movie created successfully',
      data: { movie }
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while creating movie'
    });
  }
});

// @desc    Update movie (admin only)
// @route   PUT /api/movies/:id
// @access  Private/Admin
router.put('/:id', protect, admin, validateId, validateMovie, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        error: true,
        message: 'Movie not found'
      });
    }

    res.json({
      error: false,
      message: 'Movie updated successfully',
      data: { movie }
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while updating movie'
    });
  }
});

// @desc    Delete movie (admin only)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, validateId, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        error: true,
        message: 'Movie not found'
      });
    }

    // Soft delete - mark as inactive
    movie.isActive = false;
    await movie.save();

    res.json({
      error: false,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while deleting movie'
    });
  }
});

// @desc    Get movie reviews
// @route   GET /api/movies/:id/reviews
// @access  Public
router.get('/:id/reviews', validateId, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const reviews = await Review.findByMovie(req.params.id, { page, limit, sort, order });

    res.json({
      error: false,
      data: {
        reviews: reviews.reviews || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((reviews.total || 0) / parseInt(limit)),
          total: reviews.total || 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching reviews'
    });
  }
});

// @desc    Get top rated movies
// @route   GET /api/movies/top-rated
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const movies = await Movie.findTopRated(parseInt(limit));

    res.json({
      error: false,
      data: { movies }
    });
  } catch (error) {
    console.error('Get top rated movies error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching top rated movies'
    });
  }
});

// @desc    Get recent releases
// @route   GET /api/movies/recent
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const movies = await Movie.findRecentReleases(parseInt(limit));

    res.json({
      error: false,
      data: { movies }
    });
  } catch (error) {
    console.error('Get recent releases error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching recent releases'
    });
  }
});

// @desc    Get movies by genre
// @route   GET /api/movies/genre/:genre
// @access  Public
router.get('/genre/:genre', validatePagination, async (req, res) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 20, sort = 'rating.average', order = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const movies = await Movie.find({ 
      genre: genre, 
      isActive: true 
    })
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments({ genre: genre, isActive: true });

    res.json({
      error: false,
      data: {
        movies,
        genre,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get movies by genre error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching movies by genre'
    });
  }
});

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
router.get('/search', validatePagination, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: true,
        message: 'Search query is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movies = await Movie.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments({ $text: { $search: q }, isActive: true });

    res.json({
      error: false,
      data: {
        movies,
        query: q,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while searching movies'
    });
  }
});

module.exports = router;
