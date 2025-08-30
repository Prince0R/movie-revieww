const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for movie creation/update
const validateMovie = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('genre')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
  
  body('genre.*')
    .isIn(['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'])
    .withMessage('Invalid genre'),
  
  body('releaseYear')
    .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
    .withMessage('Release year must be between 1888 and current year + 5'),
  
  body('director')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Director name must be between 1 and 100 characters'),
  
  body('synopsis')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Synopsis must be between 10 and 2000 characters'),
  
  body('posterUrl')
    .isURL()
    .withMessage('Poster URL must be a valid URL'),
  
  body('runtime')
    .isInt({ min: 1 })
    .withMessage('Runtime must be at least 1 minute'),
  
  handleValidationErrors
];

// Validation rules for review creation/update
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Review comment must be between 10 and 2000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Review title must be between 1 and 100 characters'),
  
  body('spoiler')
    .optional()
    .isBoolean()
    .withMessage('Spoiler must be a boolean value'),
  
  handleValidationErrors
];

// Validation rules for user profile update
const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('preferences.favoriteGenres.*')
    .optional()
    .isIn(['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'])
    .withMessage('Invalid genre'),
  
  handleValidationErrors
];

// Validation rules for watchlist operations
const validateWatchlist = [
  body('status')
    .optional()
    .isIn(['plan_to_watch', 'watching', 'completed', 'dropped'])
    .withMessage('Invalid watchlist status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  
  handleValidationErrors
];

// Validation rules for pagination and filtering
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['title', 'releaseYear', 'rating.average', 'rating.count', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either "asc" or "desc"'),
  
  handleValidationErrors
];

// Validation rules for movie search
const validateMovieSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty'),
  
  query('genre')
    .optional()
    .isIn(['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'])
    .withMessage('Invalid genre'),
  
  query('year')
    .optional()
    .isInt({ min: 1888, max: new Date().getFullYear() + 5 })
    .withMessage('Invalid year'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Minimum rating must be between 0 and 10'),
  
  query('maxRating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Maximum rating must be between 0 and 10'),
  
  handleValidationErrors
];

// Validation rules for ID parameters
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateMovie,
  validateReview,
  validateProfileUpdate,
  validateWatchlist,
  validatePagination,
  validateMovieSearch,
  validateId,
  handleValidationErrors
};
