'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { dashboardApi, clientApi, policyApi, reminderApi } from '@/lib/api'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [kpis, setKpis] = useState({
    totalClients: 0,
    activePolicies: 0,
    expiringSoon: 0,
    documentsUploaded: 0,
    pendingReminders: 0,
    totalPremium: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Get Dashboard KPIs
      const dashboardResult = await dashboardApi.getKPIs()
      
      // Get additional data
      const [clientsResult, policiesResult, remindersResult] = await Promise.all([
        clientApi.getAll(),
        policyApi.getAll(),
        reminderApi.getPending()
      ])

      // Count documents (from all policies)
      let totalDocuments = 0
      if (policiesResult.data) {
        for (const policy of policiesResult.data) {
          const { data: docs } = await supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('policy_id', policy.id)
          totalDocuments += docs?.length || 0
        }
      }

      setKpis({
        totalClients: dashboardResult.data?.total_clients || clientsResult.data?.length || 0,
        activePolicies: dashboardResult.data?.active_policies || 0,
        expiringSoon: dashboardResult.data?.expiring_soon || 0,
        documentsUploaded: totalDocuments,
        pendingReminders: remindersResult.data?.length || 0,
        totalPremium: dashboardResult.data?.total_active_premium || 0
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Agent'
  const firstName = userName.split(' ')[0]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your insurance business today
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.totalClients}</p>
              <p className="text-xs text-gray-500 mt-2">Active customers</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Policies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.activePolicies}</p>
              <p className="text-xs text-gray-500 mt-2">Currently active</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-600">{kpis.expiringSoon}</p>
              <p className="text-xs text-gray-500 mt-2">Next 30 days</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Premium */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Premium</p>
              <p className="text-3xl font-bold text-gray-900">₹{(kpis.totalPremium / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-2">Active policies</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Documents Uploaded */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Documents</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.documentsUploaded}</p>
              <p className="text-xs text-gray-500 mt-2">Total uploaded</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Reminders</p>
              <p className="text-3xl font-bold text-red-600">{kpis.pendingReminders}</p>
              <p className="text-xs text-gray-500 mt-2">Require action</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/customers/add"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Client</p>
                <p className="text-sm text-gray-500">Register a new customer</p>
              </div>
            </a>

            <a
              href="/customers"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">View All Clients</p>
                <p className="text-sm text-gray-500">Browse customer database</p>
              </div>
            </a>

            <a
              href="/profile"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Account Settings</p>
                <p className="text-sm text-gray-500">Manage your profile</p>
              </div>
            </a>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Average Premium</span>
              <span className="font-semibold text-gray-900">
                ₹{kpis.activePolicies > 0 ? ((kpis.totalPremium / kpis.activePolicies) / 1000).toFixed(1) : '0'}K
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Policies per Client</span>
              <span className="font-semibold text-gray-900">
                {kpis.totalClients > 0 ? (kpis.activePolicies / kpis.totalClients).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Renewal Rate</span>
              <span className="font-semibold text-green-600">--</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Documents per Policy</span>
              <span className="font-semibold text-gray-900">
                {kpis.activePolicies > 0 ? (kpis.documentsUploaded / kpis.activePolicies).toFixed(1) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
              value={customerCount}
              label="Total Customers"
              trend={customerCount > 0 ? "up" : null}
              trendValue={customerCount > 0 ? "+0% from last month" : null}
              iconBg="bg-gradient-primary"
              iconColor="text-white"
            />
          </div>

          <div style={{ animationDelay: '0.2s' }} className="animate-fade-in-up">
            <KPICard
              icon={
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              }
              value="0"
              label="Active Policies"
              iconBg="bg-gradient-purple"
              iconColor="text-white"
            />
          </div>

          <div style={{ animationDelay: '0.3s' }} className="animate-fade-in-up">
            <KPICard
              icon={
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              }
              value="₹0"
              label="Total Premium"
              iconBg="bg-gradient-success"
              iconColor="text-white"
            />
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ animationDelay: '0.4s' }} className="animate-fade-in-up mb-8">
          <SectionHeader
            title="Quick Actions"
            subtitle="Common tasks and shortcuts"
            icon={
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              href="/customers/add"
              icon={
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              }
              title="Add Customer"
              description="Create new insurance policy"
              gradient="from-primary-start to-primary-end"
              delay="0.1s"
            />
            <ActionCard
              href="/customers"
              icon={
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              }
              title="View Customers"
              description="Browse and search policies"
              gradient="from-purple-accent to-purple-300"
              delay="0.2s"
            />
            <ActionCard
              href="/customers"
              icon={
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              }
              title="Reports"
              description="Analytics and insights"
              gradient="from-sky-accent to-sky-300"
              delay="0.3s"
            />
          </div>
        </div>

        {/* Quick Action List */}
        <div style={{ animationDelay: '0.5s' }} className="animate-fade-in-up">
          <QuickActionList actions={quickActions} />
        </div>
      </div>
    </div>
  )
}
