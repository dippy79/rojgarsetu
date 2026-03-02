// frontend/components/JobCard.js - Job card component
import Link from 'next/link';

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

    return (
        <div className="job-card">
            <div className="card-header">
                {job.is_featured && <span className="featured-badge">Featured</span>}
                <span className="category-badge" style={{ backgroundColor: categoryColor + '20', color: categoryColor }}>
                    {job.category || 'Job'}
                </span>
            </div>
            
            <h3>
                <Link href={'/jobs/' + job.id}>{job.title}</Link>
            </h3>
            
            <p className="job-company">
                {job.company || job.source || 'RojgarSetu'}
            </p>
            
            <div className="job-meta">
                <span className="meta-item">
                    📍 {job.location || 'All India'}
                </span>
                <span className="meta-item">
                    💼 {job.type === 'full-time' ? 'Full Time' : job.type || 'Full Time'}
                </span>
            </div>
            
            {job.last_date && (
                <div className="job-deadline">
                    <span className="deadline-label">Apply by:</span>
                    <span className="deadline-date">{formatDate(job.last_date)}</span>
                </div>
            )}
            
            {showApply && job.apply_link && (
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
                .job-deadline {
                    background: #fef3c7;
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                }
                .deadline-label {
                    color: #92400e;
                    font-size: 12px;
                    font-weight: 500;
                }
                .deadline-date {
                    color: #b45309;
                    font-size: 13px;
                    font-weight: 600;
                }
                .card-actions {
                    display: flex;
                    gap: 12px;
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
                .apply-btn {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                }
                .apply-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
                }
            `}</style>
        </div>
    );
}
