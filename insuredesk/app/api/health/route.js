import { NextResponse } from 'next/server';
import { getEnvInfo } from '@/utils/env-validation';

/**
 * Health Check Endpoint
 * Used by load balancers, monitoring tools, and deployment platforms
 * to verify the application is running correctly
 * 
 * GET /api/health
 */
export async function GET() {
    try {
        // Get environment configuration status
        const envInfo = getEnvInfo();

        // Basic health check
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: envInfo.nodeEnv,
            uptime: process.uptime(),

            // Service availability
            services: {
                database: envInfo.hasSupabaseUrl && envInfo.hasSupabaseKey ? 'available' : 'unavailable',
                cache: envInfo.redisEnabled ? 'enabled' : 'disabled',
            },

            // Build info
            build: {
                time: process.env.BUILD_TIME || 'unknown',
                nodeVersion: process.version,
            }
        };

        // Return 200 OK with health status
        return NextResponse.json(health, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });

    } catch (error) {
        // Return 503 Service Unavailable on error
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}

/**
 * HEAD request for lightweight health checks
 */
export async function HEAD() {
    return new NextResponse(null, { status: 200 });
}
