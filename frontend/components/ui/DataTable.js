// frontend/components/ui/DataTable.js - Data Table Component
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

const DataTable = ({ 
    columns = [],
    data = [],
    onRowClick,
    loading = false,
    pagination,
    onPageChange,
    onSort,
    sortBy,
    sortOrder,
    emptyMessage = 'No data available',
    actions
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (columnKey) => {
        if (onSort) {
            onSort(columnKey);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <div style={{
            background: theme.colors.background.secondary,
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden'
        }}>
            {/* Table Container */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '600px'
                }}>
                    <thead>
                        <tr style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    style={{
                                        padding: '16px 20px',
                                        textAlign: column.align || 'left',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: theme.colors.text.tertiary,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: column.sortable ? 'pointer' : 'default',
                                        whiteSpace: 'nowrap',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        justifyContent: column.align || 'flex-start'
                                    }}>
                                        {column.header}
                                        {column.sortable && (
                                            <span style={{ 
                                                opacity: sortBy === column.key ? 1 : 0.3,
                                                transition: 'opacity 0.2s'
                                            }}>
                                                {sortBy === column.key ? (
                                                    sortOrder === 'asc' ? '↑' : '↓'
                                                ) : '↕'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th style={{
                                    padding: '16px 20px',
                                    textAlign: 'right',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: theme.colors.text.tertiary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Loading skeleton
                            [...Array(5)].map((_, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} style={{ padding: '16px 20px' }}>
                                            <div style={{
                                                height: '20px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '4px',
                                                animation: 'pulse 1.5s infinite'
                                            }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} style={{
                                    padding: '60px 20px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: theme.colors.text.secondary }}>
                                        {emptyMessage}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence>
                                {data.map((row, rowIndex) => (
                                    <motion.tr
                                        key={row.id || rowIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: rowIndex * 0.05 }}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        style={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                            cursor: onRowClick ? 'pointer' : 'default',
                                            transition: 'background 0.2s'
                                        }}
                                        whileHover={{ 
                                            background: 'rgba(255, 255, 255, 0.03)'
                                        }}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex} style={{
                                                padding: '16px 20px',
                                                textAlign: column.align || 'left',
                                                color: theme.colors.text.primary,
                                                fontSize: '0.875rem'
                                            }}>
                                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td style={{
                                                padding: '16px 20px',
                                                textAlign: 'right'
                                            }}>
                                                {actions(row)}
                                            </td>
                                        )}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && data.length > 0 && (
                <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        color: theme.colors.text.secondary
                    }}>
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                        {pagination.totalCount} entries
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: currentPage === 1 
                                    ? theme.colors.text.tertiary 
                                    : theme.colors.text.primary,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 1 ? 0.5 : 1
                            }}
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{
                                        padding: '8px 16px',
                                        background: currentPage === pageNum 
                                            ? theme.colors.primary 
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= pagination.totalPages}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: currentPage >= pagination.totalPages 
                                    ? theme.colors.text.tertiary 
                                    : theme.colors.text.primary,
                                cursor: currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer',
                                opacity: currentPage >= pagination.totalPages ? 0.5 : 1
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;

