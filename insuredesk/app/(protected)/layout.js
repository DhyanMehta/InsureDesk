import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNavbar from '@/components/DashboardNavbar'
import Sidebar from '@/components/Sidebar'

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Navbar */}
        <DashboardNavbar user={user} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
