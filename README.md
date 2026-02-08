# RojgarSetu Backend API

A production-ready Express.js backend for job & course listing platform with web crawling, multilingual support, and automated scheduling.

## Features

✅ **Job & Course Management** — RESTful API for jobs and courses  
✅ **Multilingual Support** — English, Hindi, Tamil responses  
✅ **Category Filtering** — Filter by category, duration, eligibility, type  
✅ **Web Crawler** — Automated job scraping with Cheerio + Axios  
✅ **Scheduled Tasks** — Cron jobs for crawling (8 AM) and expiry management (midnight)  
✅ **Active Status Management** — Auto-mark expired jobs/courses  
✅ **PostgreSQL Database** — Robust data persistence  
✅ **CORS Enabled** — Frontend/mobile integration ready  

## Tech Stack

- **Backend**: Express.js 5.x
- **Database**: PostgreSQL 13+
- **Web Scraping**: Axios + Cheerio
- **Task Scheduling**: node-cron
- **Environment**: dotenv
- **API Documentation**: RESTful with standard HTTP methods

## Project Structure

```
RojgarSetu/
├── server.js                          # Main Express app
├── db.js                              # PostgreSQL connection
├── package.json                       # Dependencies
├── .env                               # Environment variables (DO NOT COMMIT)
├── .env.example                       # Template for .env
├── .gitignore                         # Git ignore rules
├── crawler/
│   └── jobCrawler.js                 # Web scraping logic
├── routes/
│   ├── jobs.js                       # Job routes
│   └── courses.js                    # Course routes
└── controllers/
    ├── jobsController.js             # Job business logic
    └── coursesController.js          # Course business logic
```

## Installation

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/RojgarSetu.git
cd RojgarSetu
npm install
```

### 2. Setup PostgreSQL Database
```bash
# Create database
createdb rojgarsetu

# Create jobs table
psql rojgarsetu -c "
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(50),
  apply_link VARCHAR(255),
  criteria TEXT,
  fees_structure VARCHAR(100),
  last_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(title)
);"

# Create courses table
psql rojgarsetu -c "
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  duration VARCHAR(50),
  fees_structure VARCHAR(100),
  eligibility VARCHAR(100),
  apply_link VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"
```

### 3. Environment Setup
```bash
# Copy template and add your credentials
cp .env.example .env

# Edit .env with your database credentials
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=rojgarsetu
```

### 4. Start Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### Jobs
| Endpoint | Method | Params | Description |
|----------|--------|--------|-------------|
| `/jobs` | GET | `?lang=en\|hi\|ta` | Get all active jobs |
| `/jobs/:id` | GET | `?lang=en\|hi\|ta` | Get job by ID (checks expiry) |

### Courses
| Endpoint | Method | Params | Description |
|----------|--------|--------|-------------|
| `/courses` | GET | `?category=&duration=&eligibility=&lang=en\|hi\|ta` | Get filtered courses |
| `/courses/:id` | GET | `?lang=en\|hi\|ta` | Get course by ID (checks expiry) |
| `/courses` | POST | `body: {name, category, duration, ...}` | Add new course |

### Health Check
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API status |
| `/test-db` | GET | Test database connection |

## Automated Tasks (Cron)

**8:00 AM Daily** — `scrapeGovJobs()`
- Crawls job portals
- Inserts new jobs (skips duplicates)

**Midnight Daily** — Mark expired jobs
- Updates `is_active = FALSE` for jobs past `last_date`

## Environment Variables

```env
DB_USER=postgres               # PostgreSQL username
DB_PASSWORD=your_password      # PostgreSQL password
DB_HOST=localhost              # Database host
DB_PORT=5432                   # Database port
DB_NAME=rojgarsetu             # Database name
PORT=3000                      # Server port
NODE_ENV=development           # Environment
```

## Testing Endpoints

### Get all jobs
```bash
curl -X GET "http://localhost:3000/jobs?lang=en"
```

### Get course by ID
```bash
curl -X GET "http://localhost:3000/courses/1?lang=hi"
```

### Filter courses
```bash
curl -X GET "http://localhost:3000/courses?category=IT&lang=ta"
```

### Add course
```bash
curl -X POST "http://localhost:3000/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React Masterclass",
    "category": "IT",
    "duration": "8 weeks",
    "fees_structure": "₹5000",
    "eligibility": "10+2",
    "apply_link": "https://example.com/apply"
  }'
```

## Deployment

### Docker
```bash
docker build -t rojgarsetu-backend .
docker run -p 3000:3000 --env-file .env rojgarsetu-backend
```

### Vercel / DigitalOcean / AWS
1. Push to GitHub (credentials hidden via `.gitignore`)
2. Connect Git repo to hosting platform
3. Set environment variables in hosting dashboard
4. Deploy

## Future Roadmap

- [ ] Phase 2: Next.js frontend with PWA
- [ ] Phase 3: Flutter mobile app
- [ ] Phase 4: Headless browser crawler (Puppeteer)
- [ ] Phase 5: Full-text search, Redis caching, role-based auth

## License

MIT

## Contributing

Pull requests welcome! Please ensure credentials are never committed.

## Support

For issues or questions, open a GitHub issue or contact the team.
