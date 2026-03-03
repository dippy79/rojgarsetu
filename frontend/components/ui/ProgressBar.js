// frontend/components/ui/ProgressBar.js - Progress Bar Component
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

const ProgressBar = ({ 
    value = 0, 
    max = 100, 
    showLabel = false,
    size = 'md', // sm, md, lg
    color = 'primary', // primary, secondary, success, warning, danger
    animated = true,
    striped = false,
    label
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const colors = {
        primary: {
            gradient: 'linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)',
            color: '#7C3AED'
        },
        secondary: {
            gradient: 'linear-gradient(90deg, #14B8A6 0%, #5EEAD4 100%)',
            color: '#14B8A6'
        },
        success: {
            gradient: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
            color: '#10B981'
        },
        warning: {
            gradient: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
            color: '#F59E0B'
        },
        danger: {
            gradient: 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
            color: '#EF4444'
        }
    };

    const sizes = {
        sm: { height: '4px', borderRadius: '2px' },
        md: { height: '8px', borderRadius: '4px' },
        lg: { height: '12px', borderRadius: '6px' }
    };

    return (
        <div style={{ width: '100%' }}>
            {showLabel && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                }}>
                    <span style={{
                        fontSize: '0.875rem',
                        color: theme.colors.text.secondary,
                        fontWeight: 500
                    }}>
                        {label || 'Progress'}
                    </span>
                    <span style={{
                        fontSize: '0.875rem',
                        color: theme.colors.text.primary,
                        fontWeight: 600
                    }}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div style={{
                width: '100%',
                height: sizes[size].height,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: sizes[size].borderRadius,
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    initial={animated ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                        duration: animated ? 1 : 0, 
                        ease: 'easeOut',
                        delay: 0.2
                    }}
                    style={{
                        height: '100%',
                        background: colors[color].gradient,
                        borderRadius: sizes[size].borderRadius,
                        position: 'relative',
                        ...(striped && {
                            backgroundImage: `linear-gradient(
                                45deg,
                                rgba(255, 255, 255, 0.15) 25%,
                                transparent 25%,
                                transparent 50%,
                                rgba(255, 255, 255, 0.15) 50%,
                                rgba(255, 255, 255, 0.15) 75%,
                                transparent 75%,
                                transparent
                            )`,
                            backgroundSize: '1rem 1rem'
                        })
                    }}
                >
                    {/* Shine effect */}
                    {animated && (
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                repeatDelay: 2,
                                ease: 'easeInOut'
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                borderRadius: sizes[size].borderRadius
                            }}
                        />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProgressBar;

