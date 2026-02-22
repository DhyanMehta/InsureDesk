#!/usr/bin/env node

/**
 * Supabase Keep-Alive Script
 * Prevents Supabase free tier from pausing due to inactivity
 * 
 * Usage:
 *   node scripts/keep-alive.js
 *   npm run keep-alive
 * 
 * Schedule with:
 *   - GitHub Actions (recommended)
 *   - Vercel Cron
 *   - cron-job.org
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const coloredMessage = `${colors[color]}${message}${colors.reset}`;
  console.log(`[${timestamp}] ${coloredMessage}`);
  
  // Also write to log file
  const logPath = path.join(__dirname, '..', 'keep-alive.log');
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

async function pingSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  log('Pinging Supabase database...', 'blue');

  // Simple REST API call to check database connectivity
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase ping failed: ${response.status} ${response.statusText}`);
  }

  log('✓ Supabase database is active', 'green');
  return true;
}

async function pingHealthEndpoint() {
  const deployedUrl = process.env.DEPLOYED_URL || process.env.VERCEL_URL;

  if (!deployedUrl) {
    log('⚠ No DEPLOYED_URL set, skipping app health check', 'yellow');
    return true;
  }

  // Ensure URL has protocol
  const url = deployedUrl.startsWith('http') ? deployedUrl : `https://${deployedUrl}`;
  const healthUrl = `${url}/api/health`;

  log(`Pinging app health endpoint: ${healthUrl}`, 'blue');

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Supabase-Keep-Alive/1.0'
      }
    });

    if (!response.ok) {
      log(`⚠ Health check returned: ${response.status}`, 'yellow');
      return false;
    }

    const data = await response.json();
    log(`✓ App is healthy (status: ${data.status})`, 'green');
    return true;
  } catch (error) {
    log(`⚠ Health check failed: ${error.message}`, 'yellow');
    return false;
  }
}

async function keepAlive() {
  log('Starting Supabase Keep-Alive process...', 'blue');
  log('='.repeat(60));

  try {
    // Ping Supabase (most important)
    await pingSupabase();

    // Ping app health endpoint (optional)
    await pingHealthEndpoint();

    log('='.repeat(60));
    log('✓ Keep-Alive completed successfully!', 'green');
    
    return 0;
  } catch (error) {
    log('='.repeat(60));
    log(`✗ Keep-Alive failed: ${error.message}`, 'red');
    log('Stack trace:', 'red');
    log(error.stack, 'red');
    
    return 1;
  }
}

// Execute
if (require.main === module) {
  keepAlive()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`Fatal error: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { keepAlive, pingSupabase, pingHealthEndpoint };
