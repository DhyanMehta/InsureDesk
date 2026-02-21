'use client'

import Link from 'next/link'

/**
 * Action Card Component
 * Interactive card for dashboard quick actions
 */
export default function ActionCard({
    href,
    icon,
    title,
    description,
    gradient = 'from-primary-start to-primary-end',
    delay = '0s'
}) {
    return (
        <Link
            href={href}
            className="block group"
            style={{ animationDelay: delay }}
        >
            <div className="premium-card h-full group-hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white text-2xl">
                            {icon}
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
                    <p className="text-sm text-text-secondary">{description}</p>
                </div>
            </div>
        </Link>
    )
}
