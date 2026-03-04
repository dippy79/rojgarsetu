// frontend/pages/index.js - Modern Futuristic Homepage
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsAPI, coursesAPI } from '../lib/api';
import { theme, getBadgeColor } from '../styles/theme';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hover: { 
    y: -6,
    transition: { duration: 0.2 }
  }
};

// Fetcher function
const fetcher = (url) => fetch(url).then((res) => res.json());

// Job Card Component
function JobCard({ job, index }) {
  const badgeColor = getBadgeColor(job.category);
  
  return (
    <motion.div 
      className="job-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
    >
      <div className="job-card-header">
        <span 
          className="badge" 
          style={{ 
            backgroundColor: `${badgeColor}20`, 
            color: badgeColor 
          }}
        >
          {job.category}
        </span>
        {job.is_featured && (
          <span className="badge badge-featured">Featured</span>
        )}
      </div>
      
      <h3>
        <Link href={`/jobs/${job.id}`}>
          {job.title}
        </Link>
      </h3>
      
      <p className="job-company">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        {job.organization || job.source}
      </p>
      
      <div className="job-meta">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {job.location}
        </span>
        {job.salary_min && (
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            ₹{(job.salary_min/100000).toFixed(1)}L - ₹{(job.salary_max/100000).toFixed(1)}L
          </span>
        )}
      </div>
      
      {job.last_date && (
        <p className="job-meta" style={{ color: '#F59E0B' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Apply by: {new Date(job.last_date).toLocaleDateString('en-IN')}
        </p>
      )}
      
      {job.apply_link ? (
        <a 
          href={job.apply_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="apply-btn"
        >
          Apply Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </a>
      ) : (
        <button 
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="apply-btn"
        >
          Apply Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </button>
      )}
    </motion.div>
  );
}

// Course Card Component
function CourseCard({ course, index }) {
  return (
    <motion.div 
      className="course-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
    >
      <div className="job-card-header">
        <span 
          className="badge"
          style={{ 
            backgroundColor: '#14B8A620', 
            color: '#5EEAD4' 
          }}
        >
          {course.category}
        </span>
        {course.is_featured && (
          <span className="badge badge-featured">Popular</span>
        )}
      </div>
      
      <h3>
        <Link href={`/courses/${course.id}`}>
          {course.title}
        </Link>
      </h3>
      
      <p className="course-provider">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        {course.provider}
      </p>
      
      <div className="course-meta">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          {course.duration}
        </span>
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          {course.mode || 'Online'}
        </span>
      </div>
      
      {course.fees && (
        <div className="course-fees">
          {course.fees === 'Free' ? 'Free' : course.fees}
        </div>
      )}
      
      {course.apply_link ? (
        <a 
          href={course.apply_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="apply-btn"
        >
          Enroll Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </a>
      ) : (
        <button 
          onClick={() => router.push(`/courses/${course.id}`)}
          className="apply-btn"
        >
          Enroll Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </button>
      )}
    </motion.div>
  );
}

// Skeleton Loader
function JobCardSkeleton() {
  return (
    <div className="job-card">
      <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '24px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '120px', height: '40px' }} />
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="course-card">
      <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '24px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '120px', height: '40px' }} />
    </div>
  );
}

// Main Home Component
export default function Home() {
  // Fetch featured jobs
  const { data: jobsData, error: jobsError, isLoading: jobsLoading } = useSWR(
    '/api/jobs?limit=6',
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  // Fetch featured courses
  const { data: coursesData, error: coursesError, isLoading: coursesLoading } = useSWR(
    '/api/courses?limit=4',
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  const jobs = jobsData?.data || [];
  const courses = coursesData?.data || [];
  const stats = jobsData?.pagination?.totalCount || 0;
  const courseStats = coursesData?.pagination?.totalCount || 0;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your Gateway to Dream Career
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover thousands of government and private job opportunities. 
            Access professional courses to boost your career. Start your journey today!
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/jobs" className="btn btn-primary btn-lg">
              Browse Jobs
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </Link>
            <Link href="/courses" className="btn btn-secondary btn-lg">
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <motion.div 
          className="stats"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="stat-item" variants={fadeInUp}>
            <span className="stat-number">{stats}+</span>
            <span className="stat-label">Active Jobs</span>
          </motion.div>
          <motion.div className="stat-item" variants={fadeInUp}>
            <span className="stat-number">{courseStats}+</span>
            <span className="stat-label">Courses</span>
          </motion.div>
          <motion.div className="stat-item" variants={fadeInUp}>
            <span className="stat-number">50+</span>
            <span className="stat-label">Categories</span>
          </motion.div>
          <motion.div className="stat-item" variants={fadeInUp}>
            <span className="stat-number">100+</span>
            <span className="stat-label">Companies</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Jobs Section */}
      <section className="section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Featured Jobs</h2>
            <Link href="/jobs" className="section-link">
              View All Jobs
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </Link>
          </motion.div>
          
          <motion.div 
            className="jobs-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {jobsLoading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : jobsError ? (
              <div className="error-fallback">
                <h3>Unable to load jobs</h3>
                <p>Please try again later.</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.slice(0, 6).map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No jobs available</h3>
                <p>Check back soon for new opportunities!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Government Jobs Section */}
      <section className="section" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>
              <span style={{ color: theme.colors.primary }}>Government</span> Jobs
            </h2>
            <Link href="/jobs?category=Government" className="section-link">
              View All Government Jobs
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </Link>
          </motion.div>
          
          <motion.div 
            className="jobs-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {jobsLoading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : jobs.filter(j => j.is_government).length > 0 ? (
              jobs.filter(j => j.is_government).slice(0, 3).map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏛️</div>
                <h3>No government jobs available</h3>
                <p>Check back soon for new opportunities!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Private Jobs Section */}
      <section className="section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>
              <span style={{ color: theme.colors.secondary }}>Private</span> Jobs
            </h2>
            <Link href="/jobs?category=Private" className="section-link">
              View All Private Jobs
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </Link>
          </motion.div>
          
          <motion.div 
            className="jobs-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {jobsLoading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : jobs.filter(j => !j.is_government).length > 0 ? (
              jobs.filter(j => !j.is_government).slice(0, 3).map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏢</div>
                <h3>No private jobs available</h3>
                <p>Check back soon for new opportunities!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="section" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Popular Courses</h2>
            <Link href="/courses" className="section-link">
              View All Courses
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </Link>
          </motion.div>
          
          <motion.div 
            className="courses-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {coursesLoading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : coursesError ? (
              <div className="error-fallback">
                <h3>Unable to load courses</h3>
                <p>Please try again later.</p>
              </div>
            ) : courses.length > 0 ? (
              courses.slice(0, 4).map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3>No courses available</h3>
                <p>Check back soon for new courses!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Start Your Career?</h2>
          <p>Join thousands of job seekers who found their dream jobs through RojgarSetu</p>
          <div className="cta-buttons">
            <Link href="/jobs" className="btn btn-primary btn-lg">
              Find Jobs Now
            </Link>
            <Link href="/courses" className="btn btn-secondary btn-lg">
              Explore Courses
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>RojgarSetu</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
              Your trusted platform for government and private job updates, 
              along with professional courses to enhance your career.
            </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/jobs">All Jobs</Link></li>
              <li><Link href="/courses">Courses</Link></li>
              <li><Link href="/profile">My Profile</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link href="/jobs?category=Government">Government Jobs</Link></li>
              <li><Link href="/jobs?category=Private">Private Jobs</Link></li>
              <li><Link href="/jobs?category=IT">IT Jobs</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:support@rojgarsetu.com">support@rojgarsetu.com</a></li>
            <li><a href="#">FAQ</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 RojgarSetu. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: ${theme.colors.background.primary};
        }

        .hero {
          padding: 120px 20px 80px;
          background: ${theme.colors.gradients.hero};
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-content h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 20px;
          background: ${theme.colors.gradients.primary};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: ${theme.colors.text.secondary};
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 16px 32px;
          border-radius: ${theme.borderRadius.lg};
          font-weight: 600;
          font-size: 1.125rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: ${theme.colors.primary};
          color: white;
        }

        .btn-primary:hover {
          background: ${theme.colors.primaryDark};
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }

        .btn-secondary {
          background: ${theme.colors.secondary};
          color: white;
        }

        .btn-secondary:hover {
          background: ${theme.colors.secondaryDark};
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(6, 182, 212, 0.3);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section {
          padding: 80px 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .section-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: ${theme.colors.text.primary};
        }

        .section-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${theme.colors.text.secondary};
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .section-link:hover {
          color: ${theme.colors.primary};
        }

        .jobs-grid, .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .job-card, .course-card {
          background: ${theme.colors.background.secondary};
          border-radius: ${theme.borderRadius.xl};
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .job-card:hover, .course-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .job-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge {
          padding: 4px 10px;
          border-radius: ${theme.borderRadius.full};
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-featured {
          background: ${theme.colors.accent.warning}20;
          color: ${theme.colors.accent.warning};
        }

        .job-card h3, .course-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: ${theme.colors.text.primary};
        }

        .job-card h3 a, .course-card h3 a {
          color: ${theme.colors.text.primary};
          text-decoration: none;
          transition: color 0.2s;
        }

        .job-card h3 a:hover, .course-card h3 a:hover {
          color: ${theme.colors.primary};
        }

        .job-company, .course-provider {
          color: ${theme.colors.text.secondary};
          font-size: 0.875rem;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .job-meta, .course-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: ${theme.colors.text.tertiary};
          font-size: 0.8125rem;
          margin-bottom: 16px;
        }

        .job-meta span, .course-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .course-fees {
          font-size: 1.125rem;
          font-weight: 700;
          color: ${theme.colors.primary};
          margin-bottom: 16px;
        }

        .apply-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          border-radius: ${theme.borderRadius.md};
          font-weight: 500;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .apply-link:hover {
          background: ${theme.colors.primary};
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
        }

        .apply-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          background: ${theme.colors.primary};
          color: white;
          border: none;
          border-radius: ${theme.borderRadius.md};
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .apply-btn:hover {
          background: ${theme.colors.primaryDark};
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          background: ${theme.colors.background.secondary};
          border-radius: ${theme.borderRadius.xl};
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 800;
          color: ${theme.colors.primary};
          margin-bottom: 8px;
        }

        .stat-label {
          display: block;
          font-size: 0.9375rem;
          color: ${theme.colors.text.secondary};
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          background: ${theme.colors.background.secondary};
          border-radius: ${theme.borderRadius.xl};
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: ${theme.colors.text.secondary};
          margin-bottom: 8px;
        }

        .empty-state p {
          color: ${theme.colors.text.tertiary};
          margin-bottom: 24px;
        }

        .cta-section {
          text-align: center;
          padding: 80px 20px;
          background: ${theme.colors.background.secondary};
        }

        .cta-section h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: ${theme.colors.text.primary};
          margin-bottom: 16px;
        }

        .cta-section p {
          font-size: 1.25rem;
          color: ${theme.colors.text.secondary};
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .footer {
          background: ${theme.colors.background.tertiary};
          padding: 60px 0 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h4 {
          color: ${theme.colors.text.primary};
          margin-bottom: 16px;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
        }

        .footer-section li {
          margin-bottom: 8px;
        }

        .footer-section a {
          color: ${theme.colors.text.secondary};
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: ${theme.colors.primary};
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: ${theme.colors.text.tertiary};
        }

        .skeleton {
          background: linear-gradient(90deg, 
            ${theme.colors.background.tertiary} 25%, 
            ${theme.colors.background.secondary} 50%, 
            ${theme.colors.background.tertiary} 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: ${theme.borderRadius.md};
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-buttons, .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .jobs-grid, .courses-grid {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            padding: 24px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </div>
  );
}
