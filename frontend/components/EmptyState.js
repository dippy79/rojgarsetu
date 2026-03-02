// frontend/components/EmptyState.js - Empty state component
export default function EmptyState({ 
    title = "No data found", 
    message = "There are no items to display at the moment.",
    icon = "📋"
}) {
    return (
        <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{message}</p>
            <style jsx>{`
                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    background: #f8fafc;
                    border-radius: 12px;
                }
                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                h3 {
                    color: #1f2937;
                    font-size: 20px;
                    margin: 0 0 8px 0;
                }
                p {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
