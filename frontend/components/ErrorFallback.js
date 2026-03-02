// frontend/components/ErrorFallback.js - Error fallback component
export default function ErrorFallback({ 
    title = "Something went wrong", 
    message = "We couldn't load this data. Please try again.",
    onRetry = null
}) {
    return (
        <div className="error-fallback">
            <div className="error-icon">⚠️</div>
            <h3>{title}</h3>
            <p>{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="retry-btn">
                    Try Again
                </button>
            )}
            <style jsx>{`
                .error-fallback {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 40px 20px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 12px;
                }
                .error-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                h3 {
                    color: #991b1b;
                    font-size: 18px;
                    margin: 0 0 8px 0;
                }
                p {
                    color: #7f1d1d;
                    font-size: 14px;
                    margin: 0 0 16px 0;
                }
                .retry-btn {
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .retry-btn:hover {
                    background: #b91c1c;
                }
            `}</style>
        </div>
    );
}
