// GlassButton - Reusable button component with glassmorphism style
export default function GlassButton({ 
  children, 
  variant = 'primary', // primary, secondary, accent
  size = 'md', // sm, md, lg
  className = '',
  ...props 
}) {
  return (
    <button className={`glass-btn glass-btn-${variant} glass-btn-${size} ${className}`} {...props}>
      {children}
      <style jsx>{`
        .glass-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          font-family: var(--font-primary);
          font-weight: 500;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all var(--transition-normal);
          text-decoration: none;
        }
        
        /* Sizes */
        .glass-btn-sm {
          padding: var(--space-xs) var(--space-md);
          font-size: 0.75rem;
        }
        
        .glass-btn-md {
          padding: var(--space-sm) var(--space-lg);
          font-size: 0.875rem;
        }
        
        .glass-btn-lg {
          padding: var(--space-md) var(--space-xl);
          font-size: 1rem;
        }
        
        /* Variants */
        .glass-btn-primary {
          background: var(--gradient-primary);
          color: white;
          box-shadow: var(--shadow-md), var(--shadow-glow-primary);
        }
        
        .glass-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg), 0 0 30px rgba(124, 58, 237, 0.4);
        }
        
        .glass-btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--color-primary-light);
          color: var(--color-primary-light);
        }
        
        .glass-btn-accent {
          background: var(--gradient-secondary);
          color: white;
          box-shadow: var(--shadow-md), var(--shadow-glow-secondary);
        }
        
        .glass-btn-accent:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg), 0 0 30px rgba(20, 184, 166, 0.4);
        }
      `}</style>
    </button>
  );
}

