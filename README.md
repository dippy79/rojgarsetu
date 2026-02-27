# RojgarSetu - Job & Course Portal

<p align="center">
  <img src="https://img.shields.io/badge/Express.js-5.x-blue" alt="Express.js">
  <img src="https://img.shields.io/badge/Next.js-13.5-green" alt="Next.js">
  <img src="https://img.shields.io/badge/SQLite-Database-orange" alt="SQLite">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

A full-stack job and course listing platform with web crawling, multilingual support, and role-based access control. Built with Express.js backend and Next.js frontend.

## 🌟 Features

### Backend Features
- **Job Management** — Full CRUD operations with filtering, search, and pagination
- **Course Management** — Course listings with categories and filtering
- **User Authentication** — JWT-based auth with refresh tokens
- **Role-Based Access Control** — Candidate, Company, and Admin roles
- **Job Applications** — Apply, withdraw, and track applications
- **Save Jobs** — Bookmark jobs for later
- **Company Profiles** — Company dashboard and management
- **Notifications** — In-app notification system
- **Web Crawler** — Automated job scraping with Cheerio + Axios
- **Scheduled Tasks** — Cron jobs for crawling and expiry management
- **Multilingual Support** — English, Hindi, Tamil API responses
- **Security** — Helmet, CORS, rate limiting, input validation

### Frontend Features
- **Next.js 13 App Router** — Modern React framework
- **Responsive Design** — Mobile-friendly UI
- **Internationalization** — Multi-language support (EN, HI, TA)
- **Job Listings** — Browse and search jobs
- **Course Catalog** — Browse courses with filters
- **User Dashboards** — Candidate and Company dashboards
- **Applications Tracking** — Track job applications
- **Saved Jobs** — View bookmarked jobs
- **Notifications** — View notifications

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT + Refresh Tokens
- **Security**: Helmet, CORS, express-rate-limit, bcryptjs
- **Validation**: express-validator
- **Web Scraping**: Axios + Cheerio
- **Task Scheduling**: node-cron
- **Email**: Nodemailer
- **Logging**: Winston
- **File Upload**: Multer

### Frontend
- **Framework**: Next.js 13.5
- **UI**: React 18.2
- **HTTP Client**: Axios
- **Data Fetching**: SWR
- **i18n**: i18next + react-i18next

## 📁 Project Structure

```
Rojgarsetu/
├── server.js                    # Main Express server entry point
├── db.js                        # SQLite database connection
├── package.json                 # Backend dependencies
├── .env                         # Environment variables (not committed)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
│
├── config/
│   └── database.js              # Database configuration
│
├── controllers/                 # Request handlers
│   ├── authController.js        # Authentication logic
│   ├── jobsController.js        # Job business logic
│   ├── coursesController.js    # Course business logic
│   ├── profileController.js     # Profile management
│   ├── companyController.js    # Company management
│   └── notificationsController.js
│
├── routes/                      # API route definitions
│   ├── auth.js                  # /api/auth endpoints
│   ├── jobs.js                  # /api/jobs endpoints
│   ├── courses.js               # /api/courses endpoints
│   ├── profile.js               # /api/profile endpoints
│   ├── company.js               # /api/company endpoints
│   └── notifications.js        # /api/notifications endpoints
│
├── middleware/                  # Express middleware
│   ├── auth.js                  # JWT authentication & authorization
│   ├── validation.js            # Input validation
│   ├── security.js              # Security headers, rate limiting
│   └── upload.js                # File upload handling
│
├── crawler/                     # Web scraping
│   └── jobCrawler.js            # Job portal crawler
│
├── services/                    # Business services
│   └── emailService.js          # Email sending
│
├── migrations/                  # Database migrations
│   ├── 001_initial_schema.sql   # Initial schema
│   └── run_migrations.js        # Migration runner
│
├── utils/                       # Utility functions
│   └── logger.js                # Winston logger
│
├── frontend/                    # Next.js frontend
│   ├── package.json             # Frontend dependencies
│   ├── next.config.js           # Next.js configuration
│   ├── lib/
│   │   ├── api.js               # API client
│   │   └── i18n.js              # i18n configuration
│   ├── pages/                   # Next.js pages (App Router)
│   │   ├── _app.js              # App wrapper
│   │   ├── index.js             # Home page
│   │   ├── jobs/                # Jobs pages
│   │   ├── courses/             # Courses pages
│   │   ├── profile/             # Profile pages
│   │   ├── company/             # Company pages
│   │   ├── applications/        # Applications pages
│   │   ├── saved/               # Saved jobs pages
│   │   └── notifications/       # Notifications pages
│   └── styles/
│       └── globals.css          # Global styles
│
└── rojgarsetu.db                # SQLite database file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```
bash
git clone https://github.com/dippy79/rojgarsetu.git
cd rojgarsetu
```

2. **Install backend dependencies**
```
bash
npm install
```

3. **Install frontend dependencies**
```
bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**
```
bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Database
DB_FILE=rojgarsetu.db

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

5. **Run database migrations**
```
bash
node migrations/run_migrations.js
```

6. **Start the backend server**
```
bash
# Development with auto-reload
npm run dev

# Production
npm start
```

The API server runs on `http://localhost:3000`

7. **Start the frontend** (in a new terminal)
```
bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3001`

## 📚 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/refresh-token` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | User logout | ✅ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |

### Jobs (`/api/jobs`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/jobs` | Get all jobs (with filters) | Optional |
| GET | `/api/jobs/search` | Search jobs | Optional |
| GET | `/api/jobs/categories` | Get job categories | ❌ |
| GET | `/api/jobs/featured` | Get featured jobs | ❌ |
| GET | `/api/jobs/:id` | Get job by ID | Optional |
| GET | `/api/jobs/:id/similar` | Get similar jobs | Optional |
| POST | `/api/jobs` | Create new job | ✅ Company/Admin |
| PUT | `/api/jobs/:id` | Update job | ✅ Company/Admin |
| DELETE | `/api/jobs/:id` | Delete job | ✅ Company/Admin |
| POST | `/api/jobs/:id/save` | Save job | ✅ Candidate |
| DELETE | `/api/jobs/:id/save` | Unsave job | ✅ Candidate |
| GET | `/api/jobs/saved` | Get saved jobs | ✅ Candidate |
| POST | `/api/jobs/:id/apply` | Apply to job | ✅ Candidate |
| DELETE | `/api/jobs/:id/apply` | Withdraw application | ✅ Candidate |
| GET | `/api/jobs/applications` | Get my applications | ✅ Candidate |
| GET | `/api/jobs/applications/:id` | Get application by ID | ✅ Candidate |

### Courses (`/api/courses`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courses` | Get all courses (with filters) | Optional |
| GET | `/api/courses/search` | Search courses | Optional |
| GET | `/api/courses/categories` | Get course categories | ❌ |
| GET | `/api/courses/featured` | Get featured courses | ❌ |
| GET | `/api/courses/:id` | Get course by ID | Optional |
| GET | `/api/courses/:id/similar` | Get similar courses | Optional |
| POST | `/api/courses` | Create new course | ✅ Company/Admin |
| PUT | `/api/courses/:id` | Update course | ✅ Company/Admin |
| DELETE | `/api/courses/:id` | Delete course | ✅ Company/Admin |

### Profile (`/api/profile`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile/candidate` | Get candidate profile | ✅ Candidate |
| PUT | `/api/profile/candidate` | Update candidate profile | ✅ Candidate |
| GET | `/api/profile/candidate/dashboard` | Candidate dashboard | ✅ Candidate |
| GET | `/api/profile/company` | Get company profile | ✅ Company |
| PUT | `/api/profile/company` | Update company profile | ✅ Company |
| GET | `/api/profile/company/dashboard` | Company dashboard | ✅ Company |

### Company (`/api/company`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/company/:id` | Get company public profile | ❌ |
| GET | `/api/company/:id/jobs` | Get company jobs | ❌ |
| GET | `/api/company/:id/courses` | Get company courses | ❌ |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get user notifications | ✅ |
| GET | `/api/notifications/:id` | Get notification by ID | ✅ |
| PUT | `/api/notifications/:id/read` | Mark as read | ✅ |
| PUT | `/api/notifications/read-all` | Mark all as read | ✅ |
| DELETE | `/api/notifications/:id` | Delete notification | ✅ |
| DELETE | `/api/notifications` | Delete all notifications | ✅ |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |
| GET | `/api/test-db` | Database connection test |

## 🔗 Query Parameters

### Language Support
All endpoints support `lang` parameter for multilingual responses:
- `en` - English (default)
- `hi` - Hindi
- `ta` - Tamil

Example: `GET /api/jobs?lang=hi`

### Job Filters
```
GET /api/jobs?category=&type=&location=&page=&limit=&sort=
```

### Course Filters
```
GET /api/courses?category=&mode=&page=&limit=&sort=
```

## ⏰ Scheduled Tasks (Cron Jobs)

| Time | Task | Description |
|------|------|-------------|
| Daily 8:00 AM | Job Crawler | Scrapes job portals for new jobs |
| Daily Midnight | Expiry Check | Marks expired jobs as inactive |
| Weekly Sunday 2:00 AM | Token Cleanup | Removes expired refresh tokens |

## 🗄 Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `role` - candidate, company, admin
- `created_at` - Timestamp

### Jobs Table
- `id` - Primary key
- `title` - Job title
- `company_id` - Foreign key to users
- `category` - Job category
- `type` - Full-time/Part-time/Contract
- `location` - Job location
- `description` - Job description
- `requirements` - Requirements
- `salary` - Salary range
- `apply_link` - Application URL
- `last_date` - Application deadline
- `is_active` - Active status
- `created_at` - Timestamp

### Applications Table
- `id` - Primary key
- `job_id` - Foreign key to jobs
- `candidate_id` - Foreign key to users
- `status` - pending, accepted, rejected
- `applied_at` - Timestamp

### Saved Jobs Table
- `id` - Primary key
- `job_id` - Foreign key to jobs
- `candidate_id` - Foreign key to users
- `saved_at` - Timestamp

### And more tables for courses, profiles, notifications...

## 🧪 Testing Examples

### Register a new user
```
bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "candidate",
    "name": "John Doe"
  }'
```

### Login
```
bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get all jobs (Hindi)
```
bash
curl -X GET "http://localhost:3000/api/jobs?lang=hi"
```

### Search jobs
```
bash
curl -X GET "http://localhost:3000/api/jobs/search?q=software"
```

### Filter courses
```
bash
curl -X GET "http://localhost:3000/api/courses?category=IT&lang=ta"
```

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
1. Push to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables (`NEXT_PUBLIC_API_URL`)
4. Deploy

### Docker
```
bash
# Build Docker image
docker build -t rojgarsetu-backend .

# Run container
docker run -p 3000:3000 --env-file .env rojgarsetu-backend
```

## 📝 Environment Variables

```
env
# Server
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Database
DB_FILE=rojgarsetu.db

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3001
```

## 🔐 Security Features

- JWT access and refresh tokens
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Rate limiting on auth endpoints
- Input validation and sanitization
- Security headers with Helmet
- CORS configuration
- SQL injection prevention
- XSS protection

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Job crawler inspired by government job portals
- Built with modern web technologies
- Thanks to all contributors!

## 📧 Support

For issues or questions, please open a GitHub issue or contact the maintainers.

---

<p align="center">Made with ❤️ for job seekers</p>
