'use client'

/**
 * KPI Card Component
 * Displays key performance indicators with icon, value, and label
 */
export default function KPICard({
    icon,
    value,
    label,
    trend,
    trendValue,
    iconBg = 'bg-gradient-primary',
    iconColor = 'text-white'
}) {
    return (
        <div className="premium-card hover:shadow-card-hover transition-all duration-300 animate-fade-in-up">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className={`kpi-icon ${iconBg} ${iconColor}`}>
                        {icon}
                    </div>
                    <div className="kpi-value">{value}</div>
                    <div className="kpi-label">{label}</div>

                    {trend && (
                        <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-success-soft' : 'text-danger-soft'
                            }`}>
                            {trend === 'up' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                            )}
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
