# eLearning Platform - Ed-Tech Bangladesh

A comprehensive, scalable eLearning platform built specifically for the Bangladeshi market, focusing on Business Studies education with asynchronous learning capabilities.

## 🌟 Features

### For Students
- 📊 **Real-time Performance Feedback** - Visual progress tracking with completion checklists
- 📚 **Asynchronous Learning** - Access pre-recorded lectures, readings, and case studies
- 💯 **Interactive Assessments** - Automated grading with immediate feedback
- 💬 **Social Collaboration** - Discussion boards and Q&A sections for peer learning
- 🎯 **Resume Course** - Continue exactly where you left off
- ♿ **Accessible Design** - WCAG-compliant interface with screen reader support

### For Instructors & Admins
- 📝 **Custom CMS** - Upload lessons, manage enrollments
- 📈 **Analytics Dashboard** - Track engagement rates and course completion
- 💰 **Integrated Payments** - SSLCommerz payment gateway for BDT transactions
- 📊 **xAPI Tracking** - Comprehensive learning activity monitoring

## 🛠️ Technology Stack

### Frontend
- **React.js** - Progressive Web App with mobile-first design
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Query** - Data fetching and caching
- **Recharts** - Analytics visualization

### Backend
- **Node.js** + **Express** - RESTful API server
- **MySQL** - Relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Multer** - File uploads

### Payment Integration
- **SSLCommerz** - Bangladesh's leading payment gateway
- Tokenization for sensitive data protection
- Support for Visa, MasterCard, American Express, and mobile banking

## 📁 Project Structure

```
Ed-tec platform/
├── client/                 # React frontend (PWA)
├── server/                # Node.js/Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, security, validation
│   ├── routes/           # API endpoints
│   ├── utils/            # Helper functions
│   └── index.js          # Server entry point
├── database/             # Database schema and migrations
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   cd "K:\Web Development\Ed-tec platform"
   ```

2. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE edtech_platform;
   
   # Import schema
   mysql -u root -p edtech_platform < database/schema.sql
   ```

3. **Configure environment variables**
   ```bash
   # Copy example environment file
   cd server
   copy .env.example .env
   
   # Edit .env with your configuration
   # - Database credentials
   # - JWT secret
   # - SSLCommerz credentials (use sandbox for testing)
   ```

4. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```
   Application will open on `http://localhost:3000`

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable salt rounds
- **Data Tokenization** - Sensitive payment data encrypted, not stored
- **SSL/TLS** - All data in transit encrypted
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - SQL injection and XSS prevention
- **CORS** - Configured cross-origin resource sharing

## 💳 Payment Integration (SSLCommerz)

### Test Mode Setup
1. Get sandbox credentials from [SSLCommerz](https://developer.sslcommerz.com/)
2. Add credentials to `.env` file:
   ```
   SSLCOMMERZ_STORE_ID=your_test_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_test_password
   SSLCOMMERZ_SANDBOX=true
   ```

### Test Cards
- **Visa**: 4111111111111111
- **MasterCard**: 5555555555554444
- Use any future expiry date and any CVV

## 📊 xAPI Learning Tracking

The platform implements Experience API (xAPI) standards to track:
- Video watch time and completion
- Quiz attempts and scores
- Module progression
- Discussion participation

All learning activities are stored in the `xapi_statements` table for comprehensive analytics.

## 🎓 User Roles

### Student
- Browse and enroll in courses
- Access learning materials
- Take quizzes and track progress
- Participate in discussions

### Instructor
- Create and manage courses
- Upload lessons (videos, documents, case studies)
- View student analytics
- Respond to Q&A

### Admin
- Full system access
- Manage all courses and users
- View platform-wide analytics

## 📱 Progressive Web App (PWA)

The frontend is built as a PWA offering:
- Mobile-responsive design
- Offline capability
- App-like experience
- Installable on mobile devices

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Course Endpoints
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `GET /api/my-courses` - Get enrolled courses
- `POST /api/progress` - Update progress

### Payment Endpoints
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/history` - Get transaction history

See [docs/API.md](file:///K:/Web Development/Ed-tec platform/docs/API.md) for complete API documentation.

## 🤝 Contributing

1. Follow the existing code structure
2. Write clean, commented code
3. Test all features before committing
4. Ensure security best practices

## 📄 License

This project is proprietary software for Ed-Tech Bangladesh.

## 👥 Support

For support, contact the development team or create an issue in the project tracker.

---

**Built with ❤️ for Bangladesh's education sector**
