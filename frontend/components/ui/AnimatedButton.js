// frontend/components/ui/AnimatedButton.js - Animated Button Component
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

const AnimatedButton = ({ 
    children, 
    onClick, 
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'md', // sm, md, lg
    disabled = false,
    loading = false,
    icon,
    className = '',
    type = 'button',
    ...props 
}) => {
    const variants = {
        primary: {
            background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)'
        },
        secondary: {
            background: 'linear-gradient(135deg, #14B8A6 0%, #5EEAD4 100%)',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 14px 0 rgba(20, 184, 166, 0.39)'
        },
        outline: {
            background: 'transparent',
            color: theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`,
            boxShadow: 'none'
        },
        ghost: {
            background: 'transparent',
            color: theme.colors.text.secondary,
            border: 'none',
            boxShadow: 'none'
        },
        danger: {
            background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)'
        }
    };

    const sizes = {
        sm: {
            padding: '8px 16px',
            fontSize: '0.875rem',
            borderRadius: '8px'
        },
        md: {
            padding: '12px 24px',
            fontSize: '1rem',
            borderRadius: '10px'
        },
        lg: {
            padding: '16px 32px',
            fontSize: '1.125rem',
            borderRadius: '12px'
        }
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={className}
            style={{
                ...variants[variant],
                ...sizes[size],
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                fontFamily: theme.typography.fontFamily.primary,
                transition: 'all 0.2s ease',
                outline: 'none',
                border: variants[variant].border,
            }}
            whileHover={!disabled ? {
                scale: 1.02,
                boxShadow: variant === 'outline' || variant === 'ghost' 
                    ? 'none' 
                    : `0 6px 20px 0 ${variant === 'danger' ? 'rgba(239, 68, 68, 0.5)' : variant === 'secondary' ? 'rgba(20, 184, 166, 0.5)' : 'rgba(124, 58, 237, 0.5)'}`,
            } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {loading ? (
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%'
                    }}
                />
            ) : icon ? (
                <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
            ) : null}
            {children}
        </motion.button>
    );
};

export default AnimatedButton;

