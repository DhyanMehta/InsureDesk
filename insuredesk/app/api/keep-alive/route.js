import { NextResponse } from 'next/server';

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

        // ✅ Direct REST ping — no table, no RPC, always works
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('[keep-alive] supabase ping failed:', text);
            return NextResponse.json({ error: 'Supabase ping failed' }, { status: 500 });
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