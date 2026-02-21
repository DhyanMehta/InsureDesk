'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const name = user?.user_metadata?.name || 'User'
  const email = user?.email || ''
  const created_at = user?.created_at || new Date().toISOString()
  const getInitials = (email) => {
    if (!email) return 'AG'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
              {getInitials(email)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-gray-500">{email}</p>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                  <p className="text-lg text-gray-900">{name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                  <p className="text-lg text-gray-900">{email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Member Since</label>
                  <p className="text-lg text-gray-900">
                    {new Date(created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">User ID</label>
                  <p className="text-sm text-gray-500 font-mono">{user?.id?.substring(0, 20)}...</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
              <button
                onClick={() => router.push('/settings')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Edit Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
