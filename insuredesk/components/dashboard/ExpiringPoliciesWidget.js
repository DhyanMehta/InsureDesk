'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Policy, Client } from '@/types/database'
import { policyApi } from '@/lib/api'

interface ExpiringPoliciesWidgetProps {
  days?: number
  maxItems?: number
}

export default function ExpiringPoliciesWidget({ 
  days = 30, 
  maxItems = 5 
}: ExpiringPoliciesWidgetProps) {
  const [policies, setPolicies] = useState<(Policy & { client?: Client })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPolicies()
  }, [days])

  const loadPolicies = async () => {
    setLoading(true)
    const result = await policyApi.getExpiring(days)
    if (result.data) {
      setPolicies(result.data.slice(0, maxItems))
    }
    setLoading(false)
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-danger-soft'
    if (days <= 15) return 'text-warning-soft'
    return 'text-primary'
  }

  if (loading) {
    return (
      <div className="premium-card">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-warning-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Expiring Soon
        </h3>
        <span className="text-sm text-text-muted">Next {days} days</span>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-text-muted">No policies expiring soon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => {
            const daysLeft = getDaysUntilExpiry(policy.end_date)
            return (
              <Link
                key={policy.id}
                href={`/policies/${policy.id}`}
                className="block p-3 rounded-xl border border-border hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">
                      {policy.policy_number}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {policy.client?.full_name || 'Client'}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {policy.provider || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <span className={`text-sm font-semibold ${getUrgencyColor(daysLeft)}`}>
                      {daysLeft} days
                    </span>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(policy.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {policies.length > 0 && (
        <Link
          href="/policies?filter=expiring"
          className="block mt-4 text-center text-sm text-primary hover:text-primary-700 font-medium"
        >
          View all expiring policies →
        </Link>
      )}
    </div>
  )
}
