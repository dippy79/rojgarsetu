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
      
      {job.apply_link && (
        <a 
          href={job.apply_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="apply-link"
        >
          Apply Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </a>
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
      
      {course.apply_link && (
        <a 
          href={course.apply_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="apply-link"
        >
          Enroll Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12,5 19,12 12,19"/>
          </svg>
        </a>
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
              <span style={{ color: '#A78BFA' }}>Government</span> Jobs
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
              <span style={{ color: '#5EEAD4' }}>Private</span> Jobs
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
    </div>
  );
}
