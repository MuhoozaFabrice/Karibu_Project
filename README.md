# KGL Management System

A full-stack web application for managing procurement, sales, inventory, and analytics for Karibu Groceries LTD.

## Features

- **User Authentication**: Role-based login (Director, Manager, Sales Agent)
- **Procurement Management**: Record produce purchases and manage inventory
- **Sales Management**: Record cash and credit sales with automatic stock updates
- **Inventory Tracking**: Real-time stock levels by branch with alerts
- **Analytics Dashboard**: Director-level insights into sales, revenue, and branch performance

## Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- Vanilla HTML5, CSS3, JavaScript
- Chart.js for analytics visualization
- Responsive design with Bootstrap Icons

## Project Structure

```
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── procurementController.js
│   │   ├── salesController.js
│   │   └── analyticsController.js
│   ├── middleware/               # Authentication & authorization
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/                   # Database schemas
│   │   ├── User.js
│   │   ├── Sale.js
│   │   ├── CreditSale.js
│   │   ├── Procurement.js
│   │   └── Produce.js
│   ├── routes/                   # API endpoints
│   │   ├── authRoutes.js
│   │   ├── procurementRoutes.js
│   │   ├── salesRoutes.js
│   │   └── analyticsRoutes.js
│   └── server.js                 # Main server entry point
├── public/
│   ├── pages/                    # HTML templates
│   │   ├── sign-in.html
│   │   ├── manager.html
│   │   ├── sales.html
│   │   └── director.html
│   ├── js/                       # Frontend logic
│   │   ├── sign-in.js
│   │   ├── manager.js
│   │   ├── sales.js
│   │   └── director.js
│   └── css/                      # Stylesheets
│       ├── sign-in.css
│       ├── manager.css
│       ├── sales.css
│       └── director.css
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template (for git)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Karibu_Project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
# For local development:
MONGO_URI=mongodb://127.0.0.1:27017/kgl_db
JWT_SECRET=your_secure_random_secret_here
PORT=5000
```

4. **Start MongoDB (if running locally):**
```bash
# On Windows
mongod

# On macOS/Linux
brew services start mongodb-community
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The server will restart automatically on file changes using nodemon.

### Production Mode
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

## API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login and receive JWT token

### Procurement Routes (`/api/procurement`)
- `POST /` - Create procurement record
- `GET /` - Get all procurements

### Sales Routes (`/api/sales`)
- `POST /` - Record cash sale
- `POST /credit` - Record credit sale
- `GET /branch/:branch` - Get branch stock levels

### Analytics Routes (`/api/analytics`)
- `GET /summary` - Get analytics summary (Director only)

## Deployment Guide

### Deployment to Production

#### 1. **Environment Setup**
```bash
# Set production environment variables
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-random-secret>
PORT=5000
NODE_ENV=production
```

#### 2. **Use MongoDB Atlas (Cloud Database)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update MONGO_URI in .env

#### 3. **Deploy to Heroku**

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secure_secret
heroku config:set MONGO_URI=your_mongodb_atlas_uri

# Deploy
git push heroku main
```

#### 4. **Deploy to Vercel (Frontend)**
- Push code to GitHub
- Connect Vercel to GitHub repository
- Configure environment variables in Vercel dashboard
- Deploy

#### 5. **Deploy to AWS, Azure, or DigitalOcean**
- Use Dockerfile for containerization
- Set up continuous deployment with GitHub Actions
- Configure environment variables in the platform

### Security Checklist
- [ ] Change JWT_SECRET to a strong random string
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Enable HTTPS
- [ ] Set security headers in Express
- [ ] Validate all user inputs
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS only for trusted domains
- [ ] Regularly update dependencies

### Performance Optimization
- Add Redis for caching
- Implement request rate limiting
- Use database indexing
- Compress responses with gzip
- Implement lazy loading for frontend

## Default Test Credentials

After creating a test user via the registration endpoint:
- Email: test@example.com
- Password: Password123
- Role: manager | director | sales
- Branch: Maganjo | Matugga

## Technology Versions

```json
{
  "express": "^5.2.1",
  "mongoose": "^9.2.3",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "nodemon": "^3.1.14"
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Verify firewall rules

### Authentication Errors
- Ensure JWT_SECRET is set
- Check token expiration (default: 1 day)
- Verify Bearer token format

### Frontend Not Loading
- Clear browser cache
- Check HTML script paths
- Verify API endpoints

### CORS Errors
- Ensure CORS is enabled in server.js
- Check request headers
- Verify origin is allowed

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please create an issue in the repository.

---

**Last Updated:** March 2, 2026
**Status:** Ready for Production Deployment
