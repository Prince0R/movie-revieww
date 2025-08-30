# Star Struck Scenes Backend API

A comprehensive RESTful API for the Star Struck Scenes movie website, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - User registration and login
  - Role-based access control (Admin/User)
  - Password hashing with bcrypt

- **Movie Management**
  - CRUD operations for movies
  - Advanced search and filtering
  - Genre-based categorization
  - Rating system with automatic calculations

- **Review System**
  - User reviews with ratings (1-5 stars)
  - Helpful voting system
  - Review moderation capabilities
  - Spoiler warnings

- **Watchlist Management**
  - Personal movie watchlists
  - Status tracking (plan to watch, watching, completed, dropped)
  - Priority levels and notes
  - Public/private watchlists

- **User Profiles**
  - Customizable user profiles
  - Review history and statistics
  - Genre preferences
  - Activity tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd star-struck-scenes-main/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/star-struck-scenes
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Cloudinary Configuration (optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Movies
- `GET /api/movies` - Get all movies (with pagination & filtering)
- `GET /api/movies/:id` - Get movie by ID
- `POST /api/movies` - Create new movie (Admin only)
- `PUT /api/movies/:id` - Update movie (Admin only)
- `DELETE /api/movies/:id` - Delete movie (Admin only)
- `GET /api/movies/:id/reviews` - Get movie reviews
- `GET /api/movies/top-rated` - Get top rated movies
- `GET /api/movies/recent` - Get recent releases
- `GET /api/movies/genre/:genre` - Get movies by genre
- `GET /api/movies/search` - Search movies

### Reviews
- `POST /api/reviews` - Submit a new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark review as helpful
- `DELETE /api/reviews/:id/helpful` - Unmark review as helpful
- `GET /api/reviews/user/:userId` - Get user's reviews
- `GET /api/reviews/top-helpful` - Get top helpful reviews
- `GET /api/reviews/:id` - Get review by ID

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/reviews` - Get user's review history
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/search` - Search users
- `GET /api/users/top-reviewers` - Get top reviewers

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add movie to watchlist
- `PUT /api/watchlist/:id` - Update watchlist entry
- `DELETE /api/watchlist/:id` - Remove movie from watchlist
- `PUT /api/watchlist/:id/watched` - Mark as watched
- `PUT /api/watchlist/:id/watching` - Mark as watching
- `PUT /api/watchlist/:id/dropped` - Mark as dropped
- `PUT /api/watchlist/:id/rewatch` - Increment rewatch count
- `GET /api/watchlist/status/:status` - Get watchlist by status
- `GET /api/watchlist/priority/:priority` - Get watchlist by priority
- `GET /api/watchlist/stats` - Get watchlist statistics
- `GET /api/watchlist/popular` - Get popular watchlist movies

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### Users
- Username, email, password (hashed)
- Profile picture, bio, join date
- Admin privileges, verification status
- Genre preferences, notification settings

### Movies
- Title, genre, release year, director
- Cast, synopsis, poster URL
- Runtime, language, country
- Budget, box office, MPAA rating
- Average rating, review count

### Reviews
- User ID, movie ID, rating (1-5)
- Comment, title, spoiler warning
- Helpful votes, verification status
- Timestamps

### Watchlist
- User ID, movie ID, status
- Priority level, notes, rating
- Date added, date watched
- Rewatch count, public/private

## 🚦 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Request data validation
- **Password Hashing**: Secure password storage
- **JWT**: Stateless authentication

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "error": true,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation message",
      "value": "invalidValue"
    }
  ]
}
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Production Deployment

1. **Set environment variables**
   - `NODE_ENV=production`
   - `MONGODB_URI` (production database)
   - `JWT_SECRET` (strong secret key)

2. **Build and start**
   ```bash
   npm run build
   npm start
   ```

3. **Process management**
   - Use PM2 or similar for process management
   - Set up reverse proxy (Nginx)
   - Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔮 Future Enhancements

- Email verification system
- Password reset functionality
- Social media authentication
- Real-time notifications
- Advanced analytics
- API versioning
- GraphQL support
- Microservices architecture
