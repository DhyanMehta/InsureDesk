'use client'

import Link from 'next/link'

/**
 * Quick Action List Component
 * List of quick action links with icons
 */
export default function QuickActionList({ actions }) {
  return (
    <div className="premium-card">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {action.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary text-sm">{action.title}</p>
              <p className="text-xs text-text-secondary">{action.description}</p>
            </div>
            <svg className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
