// frontend/pages/admin/dashboard.js - Admin Dashboard Page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import { theme } from '../../styles/theme';
import { fetcher, authAPI, adminAPI } from '../../lib/api';
import StatsCard from '../../components/ui/StatsCard';
import DataTable from '../../components/ui/DataTable';
import AnimatedButton from '../../components/ui/AnimatedButton';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
    const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR(
        '/api/admin/dashboard',
        fetcher,
        { refreshInterval: 30000 }
    );

    const stats = statsData?.data || {};

    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users || 0,
            icon: '👥',
            color: 'primary',
            subtitle: `${stats.total_candidates || 0} candidates, ${stats.total_companies || 0} companies`
        },
        {
            title: 'Active Jobs',
            value: stats.total_jobs || 0,
            icon: '💼',
            color: 'secondary',
            subtitle: `${stats.government_jobs || 0} government, ${stats.private_jobs || 0} private`
        },
        {
            title: 'Total Courses',
            value: stats.total_courses || 0,
            icon: '📚',
            color: 'success',
            subtitle: 'Active courses'
        },
        {
            title: 'Applications',
            value: stats.total_applications || 0,
            icon: '📝',
            color: 'warning',
            subtitle: `${stats.new_applications_7d || 0} new this week`
        }
    ];

    const columns = [
        {
            header: 'Category',
            key: 'category',
            sortable: true
        },
        {
            header: 'Jobs Count',
            key: 'count',
            align: 'center',
            sortable: true
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: theme.colors.background.primary,
            padding: '24px'
        }}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: theme.colors.text.primary,
                        margin: 0,
                        fontFamily: theme.typography.fontFamily.heading
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{
                        color: theme.colors.text.secondary,
                        margin: '8px 0 0'
                    }}>
                        Manage users, jobs, courses, and platform analytics
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={itemVariants} style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {statCards.map((stat, index) => (
                        <StatsCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            subtitle={stat.subtitle}
                            loading={statsLoading}
                        />
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '32px',
                    flexWrap: 'wrap'
                }}>
                    <Link href="/admin/users">
                        <AnimatedButton variant="primary">
                            👥 Manage Users
                        </AnimatedButton>
                    </Link>
                    <Link href="/admin/jobs">
                        <AnimatedButton variant="secondary">
                            💼 Manage Jobs
                        </AnimatedButton>
                    </Link>
                    <Link href="/admin/courses">
                        <AnimatedButton variant="outline">
                            📚 Manage Courses
                        </AnimatedButton>
                    </Link>
                </motion.div>

                {/* Top Categories */}
                <motion.div variants={itemVariants} style={{
                    background: theme.colors.background.secondary,
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: theme.colors.text.primary,
                        margin: '0 0 20px'
                    }}>
                        Top Job Categories
                    </h2>
                    <DataTable
                        columns={columns}
                        data={stats.top_categories || []}
                        loading={statsLoading}
                        emptyMessage="No categories available"
                    />
                </motion.div>

                {/* Recent Registrations */}
                {stats.recent_registrations && stats.recent_registrations.length > 0 && (
                    <motion.div variants={itemVariants} style={{
                        marginTop: '24px',
                        background: theme.colors.background.secondary,
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: theme.colors.text.primary,
                            margin: '0 0 20px'
                        }}>
                            Recent Registrations (Last 7 Days)
                        </h2>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            {stats.recent_registrations.map((reg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        padding: '12px 20px',
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(124, 58, 237, 0.2)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: theme.colors.primary
                                    }}>
                                        {reg.count}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: theme.colors.text.secondary
                                    }}>
                                        {reg.date}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

