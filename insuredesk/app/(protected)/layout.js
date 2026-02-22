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

  // Ensure profile exists for the user (required for foreign key constraints)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existingProfile) {
    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: user.id,
          full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent',
          phone: user.user_metadata?.phone || null,
          company_name: user.user_metadata?.company_name || null
        }
      ], {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    // Ignore RLS errors - profile might already exist from another session
    if (profileError && !profileError.message.includes('row-level security')) {
      console.error('Profile creation warning:', profileError.message)
    }
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
