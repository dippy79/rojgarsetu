# RojgarSetu Phase 3 & 4 Implementation Plan

## Information Gathered:

### Current Architecture:
1. **Database**: PostgreSQL with full-text search indexes already in place
2. **Backend**: Express.js with JWT authentication, role-based access control
3. **Frontend**: Next.js with SWR for data fetching
4. **Existing Tables**: users, candidate_profiles, company_profiles, jobs, courses, job_applications, saved_jobs, saved_courses, notifications

### Current Status:
- Phase 1 & 2: COMPLETED (Auth, Jobs, Courses pages)
- Phase 3: IN PROGRESS
- Phase 4: PENDING

### Key Files Analyzed:
- server.js - Main entry point with scheduled tasks
- migrations/001_initial_schema.sql - Database schema with all tables
- controllers/authController.js - Authentication logic
- controllers/jobsController.js - Jobs CRUD with search
- routes/jobs.js - Job routes with RBAC
- frontend/lib/api.js - API client
- frontend/pages/index.js - Home page

---

## Plan: Phase 3 - Advanced Features

### 3.1 User Profile Page
**Backend:**
- [ ] Create `controllers/profileController.js` with:
  - Get candidate profile with applied/saved jobs count
  - Get company profile with jobs/stats
  - Update candidate profile (education, skills, certifications)
  - Upload resume endpoint
  
**Frontend:**
- [ ] Create `frontend/pages/profile/index.js` - Candidate profile page
- [ ] Create `frontend/pages/profile/edit.js` - Edit profile page
- [ ] Create `frontend/pages/company/dashboard.js` - Company dashboard

### 3.2 Company Dashboard
**Backend:**
- [ ] Create `controllers/companyController.js`:
  - Get company jobs with applicant counts
  - Get applicants for a job with filtering
  - Update application status (approve/reject)
  - Get analytics (views, applications)
  
**Frontend:**
- [ ] Create `frontend/pages/company/dashboard.js`
- [ ] Create `frontend/pages/company/jobs/index.js`
- [ ] Create `frontend/pages/company/applicants/[jobId].js`

### 3.3 Saved Jobs Functionality
**Backend:**
- [ ] Add endpoints to `routes/jobs.js`:
  - POST /jobs/:id/save - Save a job
  - DELETE /jobs/:id/save - Unsave a job
  - GET /jobs/saved - Get saved jobs
  
- [ ] Add endpoints for saved courses:
  - POST /courses/:id/save
  - DELETE /courses/:id/save
  - GET /courses/saved

### 3.4 Application Tracking
**Backend:**
- [ ] Add to `controllers/jobsController.js`:
  - POST /jobs/:id/apply - Apply to job
  - DELETE /jobs/:id/apply - Withdraw application
  - GET /jobs/applications - Get my applications
  - PUT /jobs/:id/applications/:appId - Update status (company)
  
- [ ] Add to `routes/jobs.js`:
  - GET /jobs/applications - My applications (candidate)
  - PUT /jobs/:jobId/applications/:appId - Update status (company)

### 3.5 Notifications Panel
**Backend:**
- [ ] Create `controllers/notificationsController.js`:
  - GET /notifications - Get user notifications
  - PUT /notifications/:id/read - Mark as read
  - PUT /notifications/read-all - Mark all as read
  - DELETE /notifications/:id - Delete notification
  - GET /notifications/unread-count
  
- [ ] Create `routes/notifications.js`

### 3.6 File Upload
**Backend:**
- [ ] Add multer configuration in `middleware/upload.js`
- [ ] Add file upload endpoint in `controllers/profileController.js`
- [ ] Create upload routes

---

## Plan: Phase 4 - Production Enhancements

### 4.1 Full-text Search (PostgreSQL)
- Already implemented in jobsController.js searchJobs
- Add autocomplete endpoint

### 4.2 Email Notifications
**Backend:**
- [ ] Create `services/emailService.js` with nodemailer
- [ ] Create email templates
- [ ] Integrate with application events

### 4.3 Dashboard Analytics
**Backend:**
- [ ] Add analytics endpoints in controllers

### 4.4 API Documentation (Swagger)
- [ ] Add swagger-jsdoc and swagger-ui-express
- [ ] Create OpenAPI specs

### 4.5 Improved Job Crawler
**Backend:**
- [ ] Enhance `crawler/jobCrawler.js` with:
  - Multiple source websites
  - Better deduplication
  - Error handling and rate limiting

---

## Implementation Order:

### Step 1: Backend Controllers & Routes (Phase 3)
1. profileController.js
2. companyController.js
3. notificationsController.js
4. Update jobsController.js with save/apply functionality

### Step 2: Backend Routes
1. Update routes/jobs.js
2. Create routes/profile.js
3. Create routes/company.js
4. Create routes/notifications.js

### Step 3: Frontend Pages (Phase 3)
1. Profile pages (candidate)
2. Company dashboard pages
3. Saved jobs/applications pages
4. Notifications panel

### Step 4: Phase 4 Enhancements
1. Email service
2. Swagger documentation
3. Enhanced crawler

---

## Files to Create:
- controllers/profileController.js
- controllers/companyController.js
- controllers/notificationsController.js
- routes/profile.js
- routes/company.js
- routes/notifications.js
- middleware/upload.js
- services/emailService.js
- frontend/pages/profile/index.js
- frontend/pages/profile/edit.js
- frontend/pages/company/dashboard.js
- frontend/pages/company/jobs/index.js
- frontend/pages/company/applicants/[jobId].js
- frontend/pages/applications/index.js
- frontend/pages/saved/index.js
- frontend/pages/notifications/index.js

## Files to Update:
- server.js (add new routes)
- routes/jobs.js (add save/apply routes)
- frontend/lib/api.js (update with new endpoints)
- TODO.md
