// frontend/components/ui/StatsCard.js - Stats Card Component
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

const StatsCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    trendValue,
    color = 'primary', // primary, secondary, success, warning, danger
    subtitle,
    loading = false
}) => {
    const colors = {
        primary: {
            gradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
            glow: 'rgba(124, 58, 237, 0.3)',
            iconBg: 'rgba(124, 58, 237, 0.2)'
        },
        secondary: {
            gradient: 'linear-gradient(135deg, #14B8A6 0%, #5EEAD4 100%)',
            glow: 'rgba(20, 184, 166, 0.3)',
            iconBg: 'rgba(20, 184, 166, 0.2)'
        },
        success: {
            gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            glow: 'rgba(16, 185, 129, 0.3)',
            iconBg: 'rgba(16, 185, 129, 0.2)'
        },
        warning: {
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            glow: 'rgba(245, 158, 11, 0.3)',
            iconBg: 'rgba(245, 158, 11, 0.2)'
        },
        danger: {
            gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
            glow: 'rgba(239, 68, 68, 0.3)',
            iconBg: 'rgba(239, 68, 68, 0.2)'
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: `0 12px 40px 0 ${colors[color].glow}` }}
            transition={{ duration: 0.3 }}
            style={{
                background: theme.colors.background.secondary,
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '150px',
                height: '150px',
                background: colors[color].gradient,
                filter: 'blur(60px)',
                opacity: 0.15,
                borderRadius: '50%'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: colors[color].iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color === 'warning' ? '#000' : colors[color].gradient.split(' ')[1],
                        fontSize: '24px'
                    }}>
                        {icon}
                    </div>

                    {trend && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                background: trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: trend === 'up' ? '#10B981' : '#EF4444',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}
                        >
                            <span>{trend === 'up' ? '↑' : '↓'}</span>
                            <span>{trendValue}</span>
                        </motion.div>
                    )}
                </div>

                {loading ? (
                    <div style={{
                        height: '40px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        animation: 'pulse 1.5s infinite'
                    }} />
                ) : (
                    <>
                        <h3 style={{
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: theme.colors.text.primary,
                            fontFamily: theme.typography.fontFamily.heading,
                            lineHeight: 1.2
                        }}>
                            {value}
                        </h3>
                        <p style={{
                            margin: '8px 0 0',
                            fontSize: '0.875rem',
                            color: theme.colors.text.secondary
                        }}>
                            {title}
                        </p>
                        {subtitle && (
                            <p style={{
                                margin: '4px 0 0',
                                fontSize: '0.75rem',
                                color: theme.colors.text.tertiary
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;

