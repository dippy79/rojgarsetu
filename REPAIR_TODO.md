# RojgarSetu Repair TODO - Step by Step Plan

## Phase 1: Database Alignment
- [x] 1.1 Check actual database schema using migrations
- [x] 1.2 Update migrations if needed to match expected columns
- [x] 1.3 Document all column names

## Phase 2: Fix Controllers
- [x] 2.1 Fix jobsController.js - Use correct DB columns:
  - organization (not company)
  - salary_min, salary_max (not salary)
  - job_type (not type)
  - apply_url (not apply_link) - Note: migration added apply_link
  - job_source (not source)
  - eligibility_criteria (not criteria)
  - last_date
- [x] 2.2 Fix coursesController.js
- [x] 2.3 Fix adminController.js

## Phase 3: Fix Job Fetching Service
- [x] 3.1 Fix services/jobFetcher.js - Match DB columns exactly

## Phase 4: Fix API Endpoints
- [ ] 4.1 Test GET /api/jobs
- [ ] 4.2 Test GET /api/jobs/:id
- [ ] 4.3 Test GET /api/courses
- [ ] 4.4 Test POST /api/auth/login
- [ ] 4.5 Test POST /api/auth/register

## Phase 5: Create Missing Frontend Pages
- [x] 5.1 Create /frontend/pages/login.js
- [x] 5.2 Create /frontend/pages/register.js

## Phase 6: Fix Frontend Data Mapping
- [x] 6.1 Fix JobCard.js - Use correct field names
- [x] 6.2 Fix CourseCard.js - Use correct field names
- [x] 6.3 Fix jobs/index.js - API response handling
- [x] 6.4 Fix courses/index.js - API response handling

## Phase 7: Admin Pages
- [ ] 7.1 Verify /admin/dashboard works
- [ ] 7.2 Verify /company/dashboard works

## Phase 8: Error Handling
- [x] 8.1 Add proper error logging to all controllers
- [x] 8.2 Ensure structured JSON responses

## Phase 9: Testing
- [ ] 9.1 Test database queries
- [ ] 9.2 Test API endpoints with Thunder Client
- [ ] 9.3 Test job fetching service
- [ ] 9.4 Test authentication
- [ ] 9.5 Test frontend pages
- [ ] 9.6 Test admin dashboard

## Expected Final Result:
- ✅ Jobs API working (GET /api/jobs returns data)
- ✅ Courses API working
- ✅ Jobs fetched from services
- ✅ Login/Register working
- ✅ Apply links working
- ✅ Admin dashboard accessible
- ✅ No broken links in frontend

