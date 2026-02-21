'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { reminderApi } from '@/lib/api'

export default function RemindersPanel({ maxItems = 5 }) {
    const [reminders, setReminders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadReminders()
    }, [])

    const loadReminders = async () => {
        setLoading(true)
        const result = await reminderApi.getPending()
        if (result.data) {
            setReminders(result.data.slice(0, maxItems))
        }
        setLoading(false)
    }

    const handleMarkAsSent = async (id) => {
        await reminderApi.markAsSent(id)
        loadReminders()
    }

    const getReminderIcon = (type) => {
        switch (type) {
            case 'policy_expiry':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'policy_renewal':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                )
        }
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Pending Reminders
                </h3>
                <Link href="/reminders" className="text-sm text-primary hover:text-primary-700 font-medium">
                    View all
                </Link>
            </div>

            {reminders.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-text-muted">No pending reminders</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reminders.map((reminder) => (
                        <div
                            key={reminder.id}
                            className="p-3 rounded-xl border border-border hover:border-warning-soft/50 hover:bg-warning-soft/5 transition-all duration-200"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-warning-soft/10 text-warning-soft flex items-center justify-center flex-shrink-0">
                                    {getReminderIcon(reminder.reminder_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-text-primary text-sm mb-1">
                                        {reminder.message || 'Reminder'}
                                    </p>
                                    {reminder.policy && (
                                        <p className="text-xs text-text-secondary">
                                            Policy: {reminder.policy.policy_number}
                                        </p>
                                    )}
                                    {reminder.client && (
                                        <p className="text-xs text-text-secondary">
                                            Client: {reminder.client.full_name}
                                        </p>
                                    )}
                                    <p className="text-xs text-text-muted mt-1">
                                        {new Date(reminder.remind_on).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleMarkAsSent(reminder.id)}
                                    className="flex-shrink-0 mt-1 text-xs px-3 py-1 rounded-full bg-success-soft/10 text-success-soft hover:bg-success-soft/20 transition-colors duration-200"
                                >
                                    Mark Done
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
