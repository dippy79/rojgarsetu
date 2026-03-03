// GlassInput - Reusable input component with glassmorphism style
export default function GlassInput({ 
  label,
  error,
  className = '',
  ...props 
}) {
  return (
    <div className={`glass-input-wrapper ${className}`}>
      {label && <label className="glass-input-label">{label}</label>}
      <input className={`glass-input ${error ? 'glass-input-error' : ''}`} {...props} />
      {error && <span className="glass-input-error-text">{error}</span>}
      <style jsx>{`
        .glass-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .glass-input-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .glass-input {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          font-family: var(--font-primary);
          font-size: 0.875rem;
          background: var(--bg-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }
        
        .glass-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        
        .glass-input::placeholder {
          color: var(--text-tertiary);
        }
        
        .glass-input-error {
          border-color: var(--accent-error);
        }
        
        .glass-input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .glass-input-error-text {
          font-size: 0.75rem;
          color: var(--accent-error);
        }
      `}</style>
    </div>
  );
}

