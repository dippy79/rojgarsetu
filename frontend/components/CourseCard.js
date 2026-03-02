// frontend/components/CourseCard.js - Course card component
import Link from 'next/link';

export default function CourseCard({ course, showEnroll = true }) {
    // Format fees
    const formatFees = (fees) => {
        if (!fees || fees === '0' || fees === 0) return 'Free';
        return `₹${fees}`;
    };

    // Get category badge color
    const getCategoryColor = (category) => {
        const colors = {
            'Government Exams': '#7c3aed',
            'IT': '#2563eb',
            'Banking': '#059669',
            'Marketing': '#dc2626',
            'Skills': '#4f46e5'
        };
        return colors[category] || '#6b7280';
    };

    const categoryColor = getCategoryColor(course.category);

    return (
        <div className="course-card">
            <div className="card-header">
                {course.is_featured && <span className="featured-badge">Featured</span>}
                <span className="category-badge" style={{ backgroundColor: categoryColor + '20', color: categoryColor }}>
                    {course.category || 'Course'}
                </span>
            </div>
            
            <h3>
                <Link href={'/courses/' + course.id}>{course.title}</Link>
            </h3>
            
            <p className="course-provider">
                {course.provider || 'RojgarSetu'}
            </p>
            
            <div className="course-meta">
                <span className="meta-item">
                    ⏱️ {course.duration || 'Self-paced'}
                </span>
                {course.level && (
                    <span className="meta-item">
                        📊 {course.level}
                    </span>
                )}
            </div>
            
            {course.fees && (
                <div className="course-fees">
                    {formatFees(course.fees)}
                </div>
            )}
            
            {showEnroll && course.apply_link && (
                <div className="card-actions">
                    <Link href={'/courses/' + course.id} className="view-btn">
                        View Details
                    </Link>
                    <a 
                        href={course.apply_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="enroll-btn"
                    >
                        Enroll Now →
                    </a>
                </div>
            )}
            
            <style jsx>{`
                .course-card {
                    background: white;
                    border-radius: 14px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                    border: 1px solid #f1f5f9;
                }
                .course-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    transform: translateY(-2px);
                }
                .card-header {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .featured-badge {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
                .course-provider {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0 0 12px 0;
                    font-weight: 500;
                }
                .course-meta {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 12px;
                }
                .meta-item {
                    color: #6b7280;
                    font-size: 13px;
                }
                .course-fees {
                    font-size: 24px;
                    font-weight: 700;
                    color: #059669;
                    margin-bottom: 16px;
                }
                .card-actions {
                    display: flex;
                    gap: 12px;
                }
                .view-btn, .enroll-btn {
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
                .enroll-btn {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                }
                .enroll-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
                }
            `}</style>
        </div>
    );
}
