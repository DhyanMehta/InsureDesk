import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');

        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { error } = await supabase.rpc('version');

        if (error) {
            console.error('[keep-alive] supabase error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const timestamp = new Date().toISOString();
        console.log('[keep-alive] success', { timestamp });

        return NextResponse.json({ success: true, timestamp }, { status: 200 });
    } catch (error) {
        const message = error?.message || 'Unexpected error';
        console.error('[keep-alive] failure:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}