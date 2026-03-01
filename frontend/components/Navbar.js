// frontend/components/Navbar.js - Sticky Navigation Bar
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Handle scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/jobs', label: 'Jobs', icon: '💼' },
    { href: '/courses', label: 'Courses', icon: '🎓' },
    { href: '/saved', label: 'Saved', icon: '🔖' },
    { href: '/applications', label: 'Applications', icon: '📋' },
  ];

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <span className="logo-icon">🔷</span>
            <span className="logo-text">RojgarSetu</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="navbar-search desktop-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {/* Navigation Links - Desktop */}
          <div className="navbar-links desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {/* Search Bar - Mobile */}
          <form onSubmit={handleSearch} className="navbar-search mobile-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {/* Quick Category Chips */}
          <div className="quick-chips">
            <Link href="/jobs?category=Bank" className="chip">🏦 Bank</Link>
            <Link href="/jobs?category=Teaching" className="chip">📚 Teaching</Link>
            <Link href="/jobs?category=Police" className="chip">👮 Police</Link>
            <Link href="/jobs?category=Engineering" className="chip">⚙️ Engineering</Link>
          </div>

          {/* Nav Links - Mobile */}
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${isActive(link.href) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--glass-border);
          transition: all var(--transition-normal);
        }

        .navbar.scrolled {
          background: var(--bg-card);
          box-shadow: var(--shadow-lg);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-sm) var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-icon {
          font-size: 1.75rem;
          filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
        }

        .logo-text {
          font-size: 1.375rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Search */
        .navbar-search {
          flex: 1;
          max-width: 480px;
          display: flex;
          align-items: center;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: var(--space-xs) var(--space-md);
          transition: all var(--transition-fast);
        }

        .navbar-search:focus-within {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-icon {
          font-size: 1rem;
          margin-right: var(--space-sm);
          opacity: 0.6;
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: var(--space-xs) 0;
          font-size: 0.9375rem;
        }

        .search-input:focus {
          outline: none;
          box-shadow: none;
        }

        /* Desktop Nav */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9375rem;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          background: var(--gray-100);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--primary-50);
          color: var(--primary-600);
        }

        .nav-icon {
          font-size: 1rem;
        }

        /* Right Section */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .theme-toggle {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          border: none;
          background: var(--bg-secondary);
          cursor: pointer;
          font-size: 1.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .theme-toggle:hover {
          background: var(--gray-100);
          transform: scale(1.05);
        }

        .mobile-menu-toggle {
          display: none;
          width: 44px;
          height: 44px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: var(--space-sm);
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 24px;
        }

        .hamburger span {
          display: block;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all var(--transition-fast);
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* Mobile Menu */
        .mobile-menu {
          display: none;
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .mobile-menu.open {
          display: block;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quick-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin: var(--space-md) 0;
        }

        .chip {
          padding: var(--space-xs) var(--space-md);
          background: var(--gray-100);
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .chip:hover {
          background: var(--primary-100);
          color: var(--primary-700);
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: var(--primary-50);
          color: var(--primary-600);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .desktop-search,
          .desktop-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-menu.open {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .navbar-container {
            padding: var(--space-sm) var(--space-md);
          }

          .logo-text {
            font-size: 1.125rem;
          }

          .navbar-container {
            gap: var(--space-sm);
          }
        }
      `}</style>
    </>
  );
}
