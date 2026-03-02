// frontend/components/Skeleton.js - Loading skeleton component
export default function Skeleton({ count = 3, type = 'card' }) {
    if (type === 'stats') {
        return (
            <div className="stats-skeleton">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton-stat">
                        <div className="skeleton-number"></div>
                        <div className="skeleton-label"></div>
                    </div>
                ))}
                <style jsx>{`
                    .stats-skeleton {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        max-width: 1000px;
                        margin: -40px auto 60px;
                        padding: 0 20px;
                    }
                    .skeleton-stat {
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                    }
                    .skeleton-number, .skeleton-label {
                        background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                        background-size: 200% 100%;
                        animation: shimmer 1.5s infinite;
                        border-radius: 4px;
                    }
                    .skeleton-number {
                        height: 32px;
                        width: 60%;
                        margin: 0 auto 12px;
                    }
                    .skeleton-label {
                        height: 14px;
                        width: 80%;
                        margin: 0 auto;
                    }
                    @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                    @media (max-width: 768px) {
                        .stats-skeleton {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="skeleton-grid">
            {[...Array(count)].map((_, i) => (
                <div key={i} className={`skeleton-${type}`}>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                    <div className="skeleton-meta"></div>
                    <div className="skeleton-link"></div>
                </div>
            ))}
            <style jsx>{`
                .skeleton-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .skeleton-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                }
                .skeleton-title, .skeleton-subtitle, .skeleton-meta, .skeleton-link {
                    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                }
                .skeleton-title {
                    height: 20px;
                    width: 80%;
                    margin-bottom: 12px;
                }
                .skeleton-subtitle {
                    height: 14px;
                    width: 50%;
                    margin-bottom: 12px;
                }
                .skeleton-meta {
                    height: 14px;
                    width: 70%;
                    margin-bottom: 16px;
                }
                .skeleton-link {
                    height: 16px;
                    width: 30%;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
