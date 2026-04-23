#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Run this before deploying to production
 * 
 * Usage: node scripts/check-production.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Track issues
let errors = [];
let warnings = [];
let passed = [];

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkExists(filePath, description) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        passed.push(`✅ ${description} exists`);
        return true;
    } else {
        errors.push(`❌ ${description} not found: ${filePath}`);
        return false;
    }
}

function checkEnvFile() {
    log('\n📋 Checking Environment Configuration...', 'blue');

    // Check .env.example exists
    checkExists('.env.example', '.env.example template');

    // Check if .env.local exists
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        passed.push('✅ .env.local file exists');

        // Read and check for required variables
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ];

        requiredVars.forEach(varName => {
            if (envContent.includes(`${varName}=`) &&
                !envContent.includes(`${varName}=your_`) &&
                !envContent.includes(`${varName}=\n`)) {
                passed.push(`✅ ${varName} is set`);
            } else {
                errors.push(`❌ ${varName} is not configured`);
            }
        });

        // Check optional Redis variables
        const optionalVars = [
            'UPSTASH_REDIS_REST_URL',
            'UPSTASH_REDIS_REST_TOKEN'
        ];

        const hasRedisUrl = envContent.includes('UPSTASH_REDIS_REST_URL=') &&
            !envContent.includes('UPSTASH_REDIS_REST_URL=your_');
        const hasRedisToken = envContent.includes('UPSTASH_REDIS_REST_TOKEN=') &&
            !envContent.includes('UPSTASH_REDIS_REST_TOKEN=your_');

        if (hasRedisUrl && hasRedisToken) {
            passed.push('✅ Redis cache configured (performance boost enabled)');
        } else {
            warnings.push('⚠️  Redis cache not configured (app will use memory cache - slower)');
        }

    } else {
        errors.push('❌ .env.local file not found - copy from .env.example');
    }
}

function checkProjectStructure() {
    log('\n📁 Checking Project Structure...', 'blue');

    const requiredFiles = [
        ['app/layout.js', 'Root layout'],
        ['app/page.js', 'Landing page'],
        ['utils/env-validation.js', 'Environment validation'],
        ['components/ErrorBoundary.js', 'Error boundary'],
        ['next.config.js', 'Next.js configuration'],
        ['package.json', 'Package configuration'],
    ];

    requiredFiles.forEach(([file, desc]) => checkExists(file, desc));

    const requiredDirs = [
        ['app/api', 'API routes'],
        ['app/(protected)', 'Protected routes'],
        ['components', 'Components'],
        ['utils', 'Utilities'],
        ['migrations', 'Database migrations'],
    ];

    requiredDirs.forEach(([dir, desc]) => {
        const fullPath = path.join(__dirname, '..', dir);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            passed.push(`✅ ${desc} directory exists`);
        } else {
            errors.push(`❌ ${desc} directory not found: ${dir}`);
        }
    });
}

function checkNextConfig() {
    log('\n⚙️  Checking Next.js Configuration...', 'blue');

    const configPath = path.join(__dirname, '..', 'next.config.js');
    if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');

        // Check for important production settings
        if (content.includes('reactStrictMode')) {
            passed.push('✅ React Strict Mode enabled');
        } else {
            warnings.push('⚠️  React Strict Mode not enabled');
        }

        if (content.includes('swcMinify')) {
            passed.push('✅ SWC minification enabled');
        } else {
            warnings.push('⚠️  SWC minification not configured');
        }

        if (content.includes('headers()')) {
            passed.push('✅ Security headers configured');
        } else {
            errors.push('❌ Security headers not configured');
        }

        if (content.includes('X-Frame-Options')) {
            passed.push('✅ Clickjacking protection enabled');
        }

        if (content.includes('X-Content-Type-Options')) {
            passed.push('✅ MIME type sniffing protection enabled');
        }
    }
}

function checkDependencies() {
    log('\n📦 Checking Dependencies...', 'blue');

    const packagePath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        const requiredDeps = [
            '@supabase/supabase-js',
            'next',
            'react',
            'react-dom',
            'bootstrap',
            'react-bootstrap'
        ];

        requiredDeps.forEach(dep => {
            if (pkg.dependencies && pkg.dependencies[dep]) {
                passed.push(`✅ ${dep} installed`);
            } else {
                errors.push(`❌ Required dependency missing: ${dep}`);
            }
        });

        // Check for Redis
        if (pkg.dependencies && pkg.dependencies['@upstash/redis']) {
            passed.push('✅ @upstash/redis installed (caching available)');
        } else {
            warnings.push('⚠️  @upstash/redis not installed (caching disabled)');
        }
    }
}

function checkMigrations() {
    log('\n🗄️  Checking Database Migrations...', 'blue');

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length > 0) {
            passed.push(`✅ Found ${files.length} migration files`);
            files.forEach(file => {
                passed.push(`   - ${file}`);
            });
            warnings.push('⚠️  Remember to run migrations in Supabase SQL Editor');
        } else {
            warnings.push('⚠️  No migration files found');
        }
    } else {
        errors.push('❌ Migrations directory not found');
    }
}

function checkGitignore() {
    log('\n🔒 Checking Git Configuration...', 'blue');

    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf8');

        if (content.includes('.env')) {
            passed.push('✅ .env files in .gitignore');
        } else {
            errors.push('❌ .env files not in .gitignore - SECURITY RISK!');
        }

        if (content.includes('node_modules')) {
            passed.push('✅ node_modules in .gitignore');
        }

        if (content.includes('.next')) {
            passed.push('✅ .next in .gitignore');
        }
    } else {
        errors.push('❌ .gitignore file not found');
    }
}

function printSummary() {
    log('\n' + '='.repeat(60), 'bold');
    log('📊 PRODUCTION READINESS SUMMARY', 'bold');
    log('='.repeat(60), 'bold');

    if (passed.length > 0) {
        log(`\n✅ Passed (${passed.length}):`, 'green');
        passed.forEach(item => log(item, 'green'));
    }

    if (warnings.length > 0) {
        log(`\n⚠️  Warnings (${warnings.length}):`, 'yellow');
        warnings.forEach(item => log(item, 'yellow'));
    }

    if (errors.length > 0) {
        log(`\n❌ Errors (${errors.length}):`, 'red');
        errors.forEach(item => log(item, 'red'));
    }

    log('\n' + '='.repeat(60), 'bold');

    if (errors.length === 0 && warnings.length === 0) {
        log('🎉 ALL CHECKS PASSED! Ready for production deployment.', 'green');
        log('\nNext steps:', 'bold');
        log('1. Run: npm run build', 'blue');
        log('2. Test: npm run test:build', 'blue');
        log('3. Deploy using PRODUCTION.md guide', 'blue');
        return 0;
    } else if (errors.length === 0) {
        log('⚠️  WARNINGS FOUND. Review warnings before deploying.', 'yellow');
        log('\nApplication will work but may have reduced performance or features.', 'yellow');
        return 0;
    } else {
        log('❌ CRITICAL ERRORS FOUND. Fix errors before deploying.', 'red');
        log('\nSee PRODUCTION.md for setup instructions.', 'yellow');
        return 1;
    }
}

// Run all checks
function runChecks() {
    log('🔍 Running Production Readiness Checks...', 'bold');
    log('='.repeat(60), 'bold');

    checkEnvFile();
    checkProjectStructure();
    checkNextConfig();
    checkDependencies();
    checkMigrations();
    checkGitignore();

    const exitCode = printSummary();
    process.exit(exitCode);
}

// Execute
runChecks();
