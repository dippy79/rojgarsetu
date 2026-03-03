// GlassCard - Reusable glassmorphism card component
export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <div className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`} {...props}>
      {children}
      <style jsx>{`
        .glass-card {
          background: var(--gradient-card);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-xl);
          padding: var(--space-lg);
          transition: all var(--transition-normal);
        }
        
        .glass-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl), 0 0 30px rgba(124, 58, 237, 0.15);
          border-color: rgba(124, 58, 237, 0.2);
        }
      `}</style>
    </div>
  );
}

