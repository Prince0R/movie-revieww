const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

const router = express.Router();

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', validateId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('preferences.favoriteGenres');

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    res.json({
      error: false,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, validateId, async (req, res) => {
  try {
    // Check if user can modify this profile
    if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: true,
        message: 'You can only modify your own profile'
      });
    }

    const { username, bio, preferences } = req.body;
    const updateData = {};

    // Check if username is being changed
    if (username && username !== req.user.username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: 'Username already taken'
        });
      }
      updateData.username = username;
    }

    if (bio !== undefined) updateData.bio = bio;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('preferences.favoriteGenres');

    res.json({
      error: false,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Get user's review history
// @route   GET /api/users/:id/reviews
// @access  Public
router.get('/:id/reviews', validateId, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const reviews = await Review.findByUser(req.params.id, { page, limit, sort, order });

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

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
router.get('/:id/stats', validateId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { user: user._id } },
      { $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        totalHelpful: { $sum: '$helpful.count' }
      }}
    ]);

    // Get genre preferences from reviews
    const genreStats = await Review.aggregate([
      { $match: { user: user._id } },
      { $lookup: {
        from: 'movies',
        localField: 'movie',
        foreignField: '_id',
        as: 'movie'
      }},
      { $unwind: '$movie' },
      { $group: {
        _id: '$movie.genre',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    const stats = {
      user: {
        id: user._id,
        username: user.username,
        joinDate: user.joinDate,
        reviewCount: user.reviewCount,
        averageRating: user.averageRating
      },
      reviews: reviewStats[0] || {
        totalReviews: 0,
        averageRating: 0,
        totalHelpful: 0
      },
      genres: genreStats
    };

    res.json({
      error: false,
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @desc    Get users by username search
// @route   GET /api/users/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: true,
        message: 'Search query is required'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      isActive: true
    })
      .select('-password')
      .sort({ username: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      username: { $regex: q, $options: 'i' },
      isActive: true
    });

    res.json({
      error: false,
      data: {
        users,
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
    console.error('Search users error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while searching users'
    });
  }
});

// @desc    Get top reviewers
// @route   GET /api/users/top-reviewers
// @access  Public
router.get('/top-reviewers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topReviewers = await User.aggregate([
      { $match: { isActive: true } },
      { $addFields: {
        reviewCount: { $size: { $ifNull: ['$reviews', []] } }
      }},
      { $match: { reviewCount: { $gt: 0 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: parseInt(limit) },
      { $project: {
        _id: 1,
        username: 1,
        profilePicture: 1,
        joinDate: 1,
        reviewCount: 1
      }}
    ]);

    res.json({
      error: false,
      data: { users: topReviewers }
    });
  } catch (error) {
    console.error('Get top reviewers error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching top reviewers'
    });
  }
});

module.exports = router;
