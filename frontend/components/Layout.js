// frontend/components/Layout.js - Global Layout Wrapper
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="layout-loading">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .layout-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top-color: var(--primary-500);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">🔷 RojgarSetu</span>
            <p className="footer-tagline">Your Gateway to Government Jobs & Professional Courses</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="/jobs">Browse Jobs</a>
              <a href="/courses">Explore Courses</a>
              <a href="/saved">Saved Jobs</a>
            </div>
            
            <div className="footer-section">
              <h4>Categories</h4>
              <a href="/jobs?category=Bank">Banking Jobs</a>
              <a href="/jobs?category=Teaching">Teaching Jobs</a>
              <a href="/jobs?category=Police">Police Jobs</a>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <a href="/help">Help Center</a>
              <a href="/contact">Contact Us</a>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} RojgarSetu. All rights reserved.</p>
            <p className="footer-credit">Made with ❤️ for Indian Job Seekers</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          padding-top: var(--space-md);
        }

        /* Footer Styles */
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          margin-top: var(--space-3xl);
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: var(--space-2xl) var(--space-lg) var(--space-lg);
        }

        .footer-brand {
          margin-bottom: var(--space-xl);
        }

        .footer-logo {
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-tagline {
          color: var(--text-muted);
          font-size: 0.9375rem;
          margin: var(--space-sm) 0 0;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-xl);
          margin-bottom: var(--space-xl);
        }

        .footer-section h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: var(--space-md);
          color: var(--text-primary);
        }

        .footer-section a {
          display: block;
          color: var(--text-muted);
          font-size: 0.875rem;
          padding: var(--space-xs) 0;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-section a:hover {
          color: var(--primary-600);
        }

        .footer-bottom {
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-md);
        }

        .footer-bottom p {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin: 0;
        }

        .footer-credit {
          color: var(--text-muted);
          font-size: 0.8125rem !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .footer-links {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .footer-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
