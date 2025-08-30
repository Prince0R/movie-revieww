const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect, authRateLimit } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate 
} = require('../middleware/validation');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit(authRateLimit);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate JWT token
    const token = user.generateAuthToken();

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      error: false,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          joinDate: user.joinDate,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: true,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Update last login
    await user.updateLastLogin();

    res.json({
      error: false,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          joinDate: user.joinDate,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('preferences.favoriteGenres');

    res.json({
      error: false,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          joinDate: user.joinDate,
          lastLogin: user.lastLogin,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          preferences: user.preferences,
          reviewCount: user.reviewCount,
          averageRating: user.averageRating
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, validateProfileUpdate, async (req, res) => {
  try {
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
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('preferences.favoriteGenres');

    res.json({
      error: false,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          joinDate: user.joinDate,
          lastLogin: user.lastLogin,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      error: false,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while changing password'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a JWT-based system, logout is handled client-side by removing the token
    // However, you could implement a blacklist or update last logout time here
    
    res.json({
      error: false,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error during logout'
    });
  }
});

// @desc    Refresh token (optional - for longer sessions)
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newToken = user.generateAuthToken();

    res.json({
      error: false,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: true,
      message: 'Server error while refreshing token'
    });
  }
});

module.exports = router;
