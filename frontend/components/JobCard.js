// frontend/components/JobCard.js - Updated Job card component with correct API field mapping
import Link from 'next/link';
import { theme } from '../styles/theme';

export default function JobCard({ job, showApply = true }) {
    // Format last date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Open';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Get category badge color
    const getCategoryColor = (category) => {
        const colors = {
            'Government': '#7c3aed',
            'Banking': '#059669',
            'Defence': '#dc2626',
            'IT': '#2563eb',
            'Private': '#4f46e5'
        };
        return colors[category] || '#6b7280';
    };

    const categoryColor = getCategoryColor(job.category);

    // Get organization - API returns 'organization' now (after fix)
    const organization = job.organization || job.source || 'RojgarSetu';

    // Format salary - API returns salary_min/salary_max or computed 'salary'
    const displaySalary = job.salary || (job.salary_min && job.salary_max 
        ? `₹${job.salary_min.toLocaleString('en-IN')} - ₹${job.salary_max.toLocaleString('en-IN')}`
        : job.salary_min ? `₹${job.salary_min.toLocaleString('en-IN')}+` : null);

    // Check if job is expired
    const isExpired = job.last_date && new Date(job.last_date) < new Date();

    return (
        <div className="job-card">
            <div className="card-header">
                {job.is_featured && <span className="featured-badge">Featured</span>}
                {job.is_government && <span className="govt-badge">Government</span>}
                <span className="category-badge" style={{ backgroundColor: categoryColor + '20', color: categoryColor }}>
                    {job.category || 'Job'}
                </span>
            </div>

            <h3>
                <Link href={'/jobs/' + job.id}>{job.title}</Link>
            </h3>

            <p className="job-company">
                {organization}
            </p>

            <div className="job-meta">
                <span className="meta-item">
                    📍 {job.location || 'All India'}
                </span>
                <span className="meta-item">
                    💼 {job.type === 'full-time' ? 'Full Time' : job.type === 'part-time' ? 'Part Time' : job.type || 'Full Time'}
                </span>
                {displaySalary && (
                    <span className="meta-item salary">
                        💰 {displaySalary}
                    </span>
                )}
            </div>

            {job.last_date && (
                <div className={`job-deadline ${isExpired ? 'expired' : ''}`}>
                    <span className="deadline-label">
                        {isExpired ? 'Expired:' : 'Apply by:'}
                    </span>
                    <span className="deadline-date">{formatDate(job.last_date)}</span>
                </div>
            )}

            {showApply && job.apply_link && !isExpired && (
                <div className="card-actions">
                    <Link href={'/jobs/' + job.id} className="view-btn">
                        View Details
                    </Link>
                    <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply-btn"
                    >
                        Apply Now →
                    </a>
                </div>
            )}

            {showApply && isExpired && (
                <div className="card-actions">
                    <Link href={'/jobs/' + job.id} className="view-btn expired-btn">
                        View Details
                    </Link>
                    <span className="expired-label">
                        Expired
                    </span>
                </div>
            )}

            <style jsx>{`
                .job-card {
                    background: white;
                    border-radius: 14px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    border: 1px solid #f1f5f9;
                }
                .job-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    transform: translateY(-2px);
                }
                .card-header {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                    flex-wrap: wrap;
                }
                .featured-badge {
                    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                    text-transform: uppercase;
                }
                .govt-badge {
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                    text-transform: uppercase;
                }
                .category-badge {
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 20px;
                }
                h3 {
                    margin: 0 0 8px 0;
                    font-size: 17px;
                    line-height: 1.4;
                }
                h3 a {
                    color: #1f2937;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                h3 a:hover {
                    color: #4f46e5;
                }
                .job-company {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0 0 12px 0;
                    font-weight: 500;
                }
                .job-meta {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 12px;
                }
                .meta-item {
                    color: #6b7280;
                    font-size: 13px;
                }
                .meta-item.salary {
                    color: #059669;
                    font-weight: 600;
                }
                .job-deadline {
                    background: #fef3c7;
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                }
                .job-deadline.expired {
                    background: #fee2e2;
                }
                .deadline-label {
                    color: #92400e;
                    font-size: 12px;
                    font-weight: 500;
                }
                .job-deadline.expired .deadline-label {
                    color: #dc2626;
                }
                .deadline-date {
                    color: #b45309;
                    font-size: 13px;
                    font-weight: 600;
                }
                .job-deadline.expired .deadline-date {
                    color: #dc2626;
                }
                .card-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .view-btn, .apply-btn {
                    flex: 1;
                    text-align: center;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .view-btn {
                    background: #f1f5f9;
                    color: #475569;
                }
                .view-btn:hover {
                    background: #e2e8f0;
                }
                .view-btn.expired-btn {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .apply-btn {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                }
                .apply-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                }
                .expired-label {
                    padding: 10px 16px;
                    background: #fee2e2;
                    color: #dc2626;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
}

