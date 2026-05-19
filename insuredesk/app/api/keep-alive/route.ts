import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    const requestSecret = request.nextUrl.searchParams.get('secret')

    if (!cronSecret || requestSecret !== cronSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { error } = await supabase.from('clients').select('*').limit(1)

    if (error) {
      throw error
    }

    const timestamp = new Date().toISOString()
    console.log('[keep-alive] success', { timestamp, table: 'clients' })

    return NextResponse.json({ ok: true, timestamp })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    console.error('[keep-alive] failure', { error: message })

    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}