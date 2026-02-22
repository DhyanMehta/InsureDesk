/**
 * Ensures a profile exists for the current user in the profiles table.
 * This is required because all foreign keys reference profiles(id), not auth.users(id).
 * 
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - Supabase client instance
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function ensureProfile(supabase) {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Check if profile exists
        const { data: existingProfile, error: selectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

        if (selectError) {
            return { success: false, error: selectError.message }
        }

        // Profile already exists
        if (existingProfile) {
            return { success: true }
        }

        // Create profile
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent',
                    phone: user.user_metadata?.phone || null,
                    company_name: user.user_metadata?.company_name || null
                }
            ])

        if (insertError) {
            return { success: false, error: 'Failed to create profile: ' + insertError.message }
        }

        return { success: true }
    } catch (err) {
        return { success: false, error: err.message }
    }
}
