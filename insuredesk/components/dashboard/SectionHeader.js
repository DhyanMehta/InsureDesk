'use client'

/**
 * Section Header Component
 * Header for dashboard sections with optional action button
 */
export default function SectionHeader({
    title,
    subtitle,
    action,
    actionLabel,
    icon
}) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white">
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                    {subtitle && (
                        <p className="text-text-secondary text-sm mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
            {action && (
                <button
                    onClick={action}
                    className="btn-primary-gradient text-sm px-4 py-2"
                >
                    {actionLabel || 'Action'}
                </button>
            )}
        </div>
    )
}
