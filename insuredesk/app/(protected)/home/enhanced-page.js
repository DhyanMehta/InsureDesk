'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import KPICard from '@/components/dashboard/KPICard'
import ActionCard from '@/components/dashboard/ActionCard'
import ExpiringPoliciesWidget from '@/components/dashboard/ExpiringPoliciesWidget'
import RecentClientsWidget from '@/components/dashboard/RecentClientsWidget'
import RemindersPanel from '@/components/dashboard/RemindersPanel'
import SectionHeader from '@/components/dashboard/SectionHeader'
import { dashboardApi } from '@/lib/api'
import type { DashboardKPIs } from '@/types/database'

export default function HomePage() {
    const [user, setUser] = useState(null)
    const [kpis, setKpis] = useState < DashboardKPIs | null > (null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        getData()
    }, [])

    const getData = async () => {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Get KPIs
        const result = await dashboardApi.getKPIs()
        if (result.data) {
            setKpis(result.data)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // Get user data from metadata
    const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Agent'
    const firstName = name.split(' ')[0]

    return (
        <div className="min-h-screen bg-gradient-bg py-8">
            <div className="max-w-dashboard mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-4xl font-bold text-text-primary mb-2">
                        Welcome back, {firstName}! 👋
                    </h1>
                    <p className="text-lg text-text-secondary">
                        Here's what's happening with your insurance business today.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div style={{ animationDelay: '0.1s' }} className="animate-fade-in-up">
                        <KPICard
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                </svg>
                            }
                            value={kpis?.total_clients || 0}
                            label="Total Clients"
                            trend={kpis && kpis.total_clients > 0 ? "up" : undefined}
                            trendValue={kpis && kpis.total_clients > 0 ? `${kpis.total_clients} active` : undefined}
                            iconBg="bg-gradient-primary"
                            iconColor="text-white"
                        />
                    </div>

                    <div style={{ animationDelay: '0.2s' }} className="animate-fade-in-up">
                        <KPICard
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                                </svg>
                            }
                            value={kpis?.active_policies || 0}
                            label="Active Policies"
                            iconBg="bg-gradient-purple"
                            iconColor="text-white"
                        />
                    </div>

                    <div style={{ animationDelay: '0.3s' }} className="animate-fade-in-up">
                        <KPICard
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            value={kpis?.expiring_soon || 0}
                            label="Expiring Soon"
                            trend={kpis && kpis.expiring_soon > 0 ? "down" : undefined}
                            trendValue={kpis && kpis.expiring_soon > 0 ? "Needs attention" : "All good"}
                            iconBg="bg-gradient-to-br from-warning-soft to-orange-400"
                            iconColor="text-white"
                        />
                    </div>

                    <div style={{ animationDelay: '0.4s' }} className="animate-fade-in-up">
                        <KPICard
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                                </svg>
                            }
                            value={`₹${((kpis?.total_active_premium || 0) / 1000).toFixed(0)}K`}
                            label="Total Premium"
                            iconBg="bg-gradient-success"
                            iconColor="text-white"
                        />
                    </div>
                </div>

                {/* Action Cards */}
                <div style={{ animationDelay: '0.5s' }} className="animate-fade-in-up mb-8">
                    <SectionHeader
                        title="Quick Actions"
                        subtitle="Common tasks and shortcuts"
                        icon={
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ActionCard
                            href="/clients/add"
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            }
                            title="Add Client"
                            description="Register new client"
                            gradient="from-primary-start to-primary-end"
                            delay="0.1s"
                        />
                        <ActionCard
                            href="/policies/add"
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                            }
                            title="New Policy"
                            description="Create insurance policy"
                            gradient="from-purple-accent to-purple-300"
                            delay="0.2s"
                        />
                        <ActionCard
                            href="/clients"
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                </svg>
                            }
                            title="View Clients"
                            description="Browse all clients"
                            gradient="from-sky-accent to-sky-300"
                            delay="0.3s"
                        />
                        <ActionCard
                            href="/policies"
                            icon={
                                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                                </svg>
                            }
                            title="View Policies"
                            description="Manage all policies"
                            gradient="from-green-400 to-emerald-500"
                            delay="0.4s"
                        />
                    </div>
                </div>

                {/* Widgets Grid */}
                <div style={{ animationDelay: '0.6s' }} className="animate-fade-in-up">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <ExpiringPoliciesWidget days={30} maxItems={6} />
                        <RecentClientsWidget maxItems={6} />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <RemindersPanel maxItems={5} />
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ animationDelay: '0.7s' }} className="animate-fade-in-up mt-8">
                    <div className="premium-card">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">
                            Business Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-xl bg-gradient-bg">
                                <p className="text-text-muted text-sm mb-1">Total Premium</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    ₹{((kpis?.total_active_premium || 0) / 1000).toFixed(1)}K
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-bg">
                                <p className="text-text-muted text-sm mb-1">Commission</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    ₹{((kpis?.total_commission || 0) / 1000).toFixed(1)}K
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-bg">
                                <p className="text-text-muted text-sm mb-1">Expired</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {kpis?.expired_policies || 0}
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-gradient-bg">
                                <p className="text-text-muted text-sm mb-1">Avg Premium</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    ₹{kpis && kpis.active_policies > 0
                                        ? ((kpis.total_active_premium / kpis.active_policies) / 1000).toFixed(1)
                                        : '0'}K
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
