import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Keep-Alive Cron Endpoint
 * Prevents Supabase free tier from pausing due to inactivity
 * 
 * Called by:
 * - Vercel Cron (configured in vercel.json)
 * - External cron services (cron-job.org, EasyCron, etc.)
 * 
 * GET /api/cron/keep-alive
 */
export async function GET(request) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ping Supabase database with a simple query
    const supabase = createClient();
    
    // Simple query to keep database active
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      throw error;
    }

    // Log the ping
    console.log('[Keep-Alive] Supabase pinged successfully', {
      timestamp: new Date().toISOString(),
      tablesChecked: ['profiles']
    });

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ping successful',
      timestamp: new Date().toISOString(),
      database: 'active'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('[Keep-Alive] Failed:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Keep-alive failed',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}

// Also support HEAD requests for lightweight checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
