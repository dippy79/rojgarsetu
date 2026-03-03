// frontend/components/ui/Modal.js - Modal Component
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';
import { useEffect } from 'react';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md', // sm, md, lg, xl, full
    showCloseButton = true,
    closeOnOverlayClick = true,
    footer 
}) => {
    const sizes = {
        sm: '400px',
        md: '500px',
        lg: '700px',
        xl: '900px',
        full: '95vw'
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                    
                    {/* Modal Content */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        maxWidth: sizes[size],
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            style={{
                                background: theme.colors.background.secondary,
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '90vh'
                            }}
                        >
                            {/* Header */}
                            {title && (
                                <div style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <h2 style={{
                                        margin: 0,
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        color: theme.colors.text.primary,
                                        fontFamily: theme.typography.fontFamily.heading
                                    }}>
                                        {title}
                                    </h2>
                                    {showCloseButton && (
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={onClose}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: theme.colors.text.secondary,
                                                fontSize: '18px'
                                            }}
                                        >
                                            ✕
                                        </motion.button>
                                    )}
                                </div>
                            )}
                            
                            {/* Body */}
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto',
                                flex: 1
                            }}>
                                {children}
                            </div>
                            
                            {/* Footer */}
                            {footer && (
                                <div style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px'
                                }}>
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;

