'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function RemindersPage() {
  const router = useRouter()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          policies (
            policy_number,
            provider,
            clients (
              name
            )
          )
        `)
        .eq('agent_id', user.id)
        .order('remind_on', { ascending: true })

      if (error) throw error
      setReminders(data || [])
    } catch (err) {
      console.error('Error fetching reminders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateReminderStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      
      // Refresh the list
      fetchReminders()
    } catch (err) {
      console.error('Error updating reminder:', err)
      setError(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'dismissed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const isPastDue = (reminderDate) => {
    return new Date(reminderDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reminders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reminders</h1>
        <p className="text-gray-600">Stay on top of important policy dates</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders</h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
                isPastDue(reminder.remind_on) && reminder.status === 'pending'
                  ? 'border-red-500'
                  : 'border-indigo-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{reminder.message}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p>
                      <span className="font-medium">Policy:</span> {reminder.policies?.policy_number || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Client:</span> {reminder.policies?.clients?.name || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {new Date(reminder.remind_on).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {isPastDue(reminder.remind_on) && reminder.status === 'pending' && (
                      <p className="text-red-600 font-medium">⚠️ Past due</p>
                    )}
                  </div>

                  {reminder.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateReminderStatus(reminder.id, 'completed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => updateReminderStatus(reminder.id, 'dismissed')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
