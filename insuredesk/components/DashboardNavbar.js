'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardNavbar({ user }) {
    const router = useRouter()

    const getInitials = (email) => {
        if (!email) return 'AG'
        return email.substring(0, 2).toUpperCase()
    }

    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Agent'

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
            <div className="flex items-center justify-end max-w-full">
                {/* Right: Profile */}
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(user?.email)}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </Link>
            </div>
        </nav>
    )
}
