// frontend/components/ui/Toast.js - Toast Notification Component
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';
import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const toast = {
        success: (message) => addToast(message, 'success'),
        error: (message) => addToast(message, 'error'),
        warning: (message) => addToast(message, 'warning'),
        info: (message) => addToast(message, 'info')
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    const typeStyles = {
        success: {
            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
            icon: '✓'
        },
        error: {
            background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
            icon: '✕'
        },
        warning: {
            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
            icon: '⚠'
        },
        info: {
            background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
            icon: 'ℹ'
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                            background: typeStyles[toast.type].background,
                            color: '#FFFFFF',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            minWidth: '300px',
                            maxWidth: '450px',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}>
                            {typeStyles[toast.type].icon}
                        </span>
                        <span style={{ flex: 1, fontWeight: 500 }}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                padding: '4px',
                                opacity: 0.7
                            }}
                        >
                            ✕
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;

