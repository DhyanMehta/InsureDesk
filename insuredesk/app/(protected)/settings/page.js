'use client'

import { useState } from 'react'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { batchQueries } from '@/utils/performance'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('companies')
    const [error, setError] = useState('')

    // Optimized master data fetching with aggressive caching (master data rarely changes)
    const { data: masterData, loading, supabase } = useSupabaseQuery(
        'master-data-all',
        async () => {
            // Fetch all master data in parallel
            const [companiesRes, providersRes, subcategoriesRes] = await Promise.all([
                supabase
                    .from('insurance_companies')
                    .select('id, name')
                    .order('name', { ascending: true }),

                supabase
                    .from('providers')
                    .select('id, name')
                    .order('name', { ascending: true }),

                supabase
                    .from('policy_subcategories')
                    .select('id, name')
                    .order('name', { ascending: true })
            ])

            if (companiesRes.error) throw companiesRes.error
            if (providersRes.error) throw providersRes.error
            if (subcategoriesRes.error) throw subcategoriesRes.error

            return {
                insuranceCompanies: companiesRes.data || [],
                providers: providersRes.data || [],
                subcategories: subcategoriesRes.data || []
            }
        },
        { staleTime: 300000 } // Cache for 5 minutes - master data rarely changes
    )

    const insuranceCompanies = masterData?.insuranceCompanies || []
    const providers = masterData?.providers || []
    const subcategories = masterData?.subcategories || []

    const tabs = [
        { id: 'companies', label: 'Insurance Companies', count: insuranceCompanies.length },
        { id: 'providers', label: 'Providers', count: providers.length },
        { id: 'subcategories', label: 'Policy Sub-Categories', count: subcategories.length }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings & Master Data</h1>
                <p className="text-gray-600">View system-wide master data used across all policies</p>
            </div>

            {/* Info Box */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">System-Wide Master Data</h3>
                        <p className="text-sm text-blue-800">
                            This master data is shared across all agents in the system. These values are managed by system administrators
                            and cannot be modified directly by individual agents.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Insurance Companies */}
                    {activeTab === 'companies' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Insurance Companies</h2>
                                <p className="text-sm text-gray-500">{insuranceCompanies.length} companies</p>
                            </div>
                            {insuranceCompanies.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No insurance companies available
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {insuranceCompanies.map(company => (
                                        <div
                                            key={company.id}
                                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{company.name}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Providers */}
                    {activeTab === 'providers' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Providers</h2>
                                <p className="text-sm text-gray-500">{providers.length} providers</p>
                            </div>
                            {providers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No providers available
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {providers.map(provider => (
                                        <div
                                            key={provider.id}
                                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Policy Sub-Categories */}
                    {activeTab === 'subcategories' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Policy Sub-Categories</h2>
                                <p className="text-sm text-gray-500">{subcategories.length} categories</p>
                            </div>
                            {subcategories.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No sub-categories available
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {subcategories.map(category => (
                                        <div
                                            key={category.id}
                                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
