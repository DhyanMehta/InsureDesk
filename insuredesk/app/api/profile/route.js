import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return user data from metadata
    const profile = {
      name: user.user_metadata?.name || '',
      email: user.email || '',
    }

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
