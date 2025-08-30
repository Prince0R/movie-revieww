const express = require('express');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { protect, authorize } = require('../middleware/auth');
const { validateReview, validateId } = require('../middleware/validation');

const router = express.Router();

// @desc    Submit a new review for a movie
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, validateReview, async (req, res) => {
  try {
    const { movieId, rating, comment, title, spoiler = false } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: true,
        message: 'Movie not found'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ user: req.user._id, movie: movieId });
    if (existingReview) {
      return res.status(400).json({
        error: true,
        message: 'You have already reviewed this movie'
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      movie: movieId,
      rating,
      comment,
      title,
      spoiler
    });

    // Populate user info for response
    await review.populate('user', 'username profilePicture');

    // Update movie rating
    await movie.updateRating();

    res.status(201).json({
      error: false,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while submitting review'
    });
  }
});

// @desc    Update user's review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, validateId, validateReview, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: true,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only edit your own reviews'
      });
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username profilePicture');

    // Update movie rating
    const movie = await Movie.findById(review.movie);
    if (movie) {
      await movie.updateRating();
    }

    res.json({
      error: false,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while updating review'
    });
  }
});

// @desc    Delete user's review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, validateId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: true,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: true,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete review
    await Review.findByIdAndDelete(req.params.id);

    // Update movie rating
    const movie = await Movie.findById(review.movie);
    if (movie) {
      await movie.updateRating();
    }

    res.json({
      error: false,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while deleting review'
    });
  }
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, validateId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: true,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpful.users.includes(req.user._id)) {
      return res.status(400).json({
        error: true,
        message: 'You have already marked this review as helpful'
      });
    }

    // Mark as helpful
    await review.markHelpful(req.user._id);

    res.json({
      error: false,
      message: 'Review marked as helpful',
      data: { helpfulCount: review.helpful.count }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while marking review as helpful'
    });
  }
});

// @desc    Unmark review as helpful
// @route   DELETE /api/reviews/:id/helpful
// @access  Private
router.delete('/:id/helpful', protect, validateId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: true,
        message: 'Review not found'
      });
    }

    // Unmark as helpful
    await review.unmarkHelpful(req.user._id);

    res.json({
      error: false,
      message: 'Review unmarked as helpful',
      data: { helpfulCount: review.helpful.count }
    });
  } catch (error) {
    console.error('Unmark helpful error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while unmarking review as helpful'
    });
  }
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
router.get('/user/:userId', validateId, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const reviews = await Review.findByUser(req.params.userId, { page, limit, sort, order });

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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching user reviews'
    });
  }
});

// @desc    Get top helpful reviews
// @route   GET /api/reviews/top-helpful
// @access  Public
router.get('/top-helpful', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const reviews = await Review.findTopHelpful(parseInt(limit));

    res.json({
      error: false,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get top helpful reviews error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching top helpful reviews'
    });
  }
});

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', validateId, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('movie', 'title posterUrl releaseYear genre');

    if (!review) {
      return res.status(404).json({
        error: true,
        message: 'Review not found'
      });
    }

    // Check if current user marked as helpful
    let isHelpfulByUser = false;
    if (req.user) {
      isHelpfulByUser = review.isHelpfulByUser(req.user._id);
    }

    res.json({
      error: false,
      data: { 
        review,
        isHelpfulByUser
      }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching review'
    });
  }
});

module.exports = router;
