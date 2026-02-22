// Skeleton loader components for instant visual feedback

export function TableSkeleton({ rows = 5, columns = 6 }) {
    return (
        <div className="animate-pulse">
            <table className="table">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i}>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex}>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="card animate-pulse">
            <div className="card-body">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
        </div>
    )
}

export function FormSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
            ))}
            <div className="h-10 bg-gray-300 rounded w-1/4"></div>
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="row g-4 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="col-md-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <TableSkeleton rows={5} columns={5} />
                </div>
            </div>
        </div>
    )
}

export function LoadingButton({ onClick, loading, children, className, ...props }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={className}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {children}...
                </>
            ) : (
                children
            )}
        </button>
    )
}
