import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase environment configuration');
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const tableName = 'profiles';

        const { error } = await supabase.from(tableName).select('id').limit(1);

        if (error) {
            throw error;
        }

        const timestamp = new Date().toISOString();
        console.log('[keep-alive] success', { tableName, timestamp });

        return NextResponse.json({ success: true, timestamp });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.log('[keep-alive] failure', { message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}