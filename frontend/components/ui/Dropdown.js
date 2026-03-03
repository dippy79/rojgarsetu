// frontend/components/ui/Dropdown.js - Dropdown Component
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

const Dropdown = ({ 
    trigger,
    items = [],
    onSelect,
    align = 'left', // left, right
    width = '200px',
    searchable = false,
    placeholder = 'Select...',
    value,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = searchable 
        ? items.filter(item => 
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : items;

    const selectedItem = items.find(item => item.value === value);

    const handleSelect = (item) => {
        if (onSelect) {
            onSelect(item);
        }
        if (onChange) {
            onChange(item.value);
        }
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: width }}>
            {/* Trigger */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                {trigger || (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            padding: '12px 16px',
                            background: theme.colors.background.tertiary,
                            borderRadius: '10px',
                            border: `1px solid ${isOpen ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            color: selectedItem ? theme.colors.text.primary : theme.colors.text.tertiary,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>{selectedItem?.label || placeholder}</span>
                        <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            ▼
                        </motion.span>
                    </motion.div>
                )}
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: align === 'right' ? 'auto' : 0,
                            right: align === 'right' ? 0 : 'auto',
                            marginTop: '8px',
                            width: '100%',
                            minWidth: '200px',
                            background: theme.colors.background.secondary,
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Search Input */}
                        {searchable && (
                            <div style={{
                                padding: '12px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: theme.colors.background.tertiary,
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: theme.colors.text.primary,
                                        fontSize: '0.875rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        )}

                        {/* Menu Items */}
                        <div style={{
                            maxHeight: '250px',
                            overflowY: 'auto',
                            padding: '8px'
                        }}>
                            {filteredItems.length === 0 ? (
                                <div style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    color: theme.colors.text.tertiary,
                                    fontSize: '0.875rem'
                                }}>
                                    No items found
                                </div>
                            ) : (
                                filteredItems.map((item, index) => (
                                    <motion.div
                                        key={item.value || index}
                                        onClick={() => handleSelect(item)}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        whileHover={{ 
                                            background: 'rgba(124, 58, 237, 0.1)',
                                            x: 4
                                        }}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: item.value === value 
                                                ? theme.colors.primary 
                                                : theme.colors.text.primary,
                                            fontSize: '0.875rem',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {item.icon && (
                                            <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                        )}
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {item.value === value && (
                                            <span style={{ color: theme.colors.primary }}>✓</span>
                                        )}
                                        {item.badge && (
                                            <span style={{
                                                padding: '2px 8px',
                                                background: 'rgba(124, 58, 237, 0.2)',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                color: theme.colors.primary
                                            }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;

