'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientApi } from '@/lib/api'

export default function RecentClientsWidget({ maxItems = 5 }) {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadClients()
    }, [maxItems])

    const loadClients = async () => {
        setLoading(true)
        const result = await clientApi.getAll()
        if (result.data) {
            setClients(result.data.slice(0, maxItems))
        }
        setLoading(false)
    }

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const getAvatarColor = (name) => {
        const colors = [
            'bg-gradient-to-br from-blue-400 to-blue-600',
            'bg-gradient-to-br from-purple-400 to-purple-600',
            'bg-gradient-to-br from-pink-400 to-pink-600',
            'bg-gradient-to-br from-green-400 to-green-600',
            'bg-gradient-to-br from-yellow-400 to-yellow-600',
            'bg-gradient-to-br from-indigo-400 to-indigo-600',
        ]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
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
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Recent Clients
                </h3>
                <Link href="/clients" className="text-sm text-primary hover:text-primary-700 font-medium">
                    View all
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-text-muted mb-3">No clients yet</p>
                    <Link
                        href="/clients/add"
                        className="btn-primary-gradient text-sm inline-block px-4 py-2"
                    >
                        Add First Client
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {clients.map((client) => (
                        <Link
                            key={client.id}
                            href={`/clients/${client.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors duration-200"
                        >
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(client.full_name)} flex items-center justify-center text-white font-semibold text-sm shadow-soft`}>
                                {getInitials(client.full_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-text-primary text-sm truncate">
                                    {client.full_name}
                                </p>
                                <p className="text-xs text-text-secondary truncate">
                                    {client.phone}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {client.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
