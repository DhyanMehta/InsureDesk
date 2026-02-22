# 🚀 Production Deployment Guide

Complete guide to deploying InsureDesk to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set all **required** environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] (Optional) Set Redis cache variables for better performance:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] Verify environment variables: Visit `/api/health` endpoint

### 2. Database Setup (Supabase)

- [ ] Create Supabase project at [https://supabase.com](https://supabase.com)
- [ ] Run all migrations in order:
  ```bash
  # Run these SQL files in Supabase SQL Editor
  1. migrations/01_database_indexes.sql
  2. migrations/02_rls_policies.sql
  3. migrations/03_complete_schema_update.sql
  ```
- [ ] Create storage bucket:
  ```sql
  -- Create bucket for policy documents
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('policy-documents', 'policy-documents', true);
  ```
- [ ] Configure storage policies (see migrations/02_rls_policies.sql)
- [ ] Verify tables exist: profiles, clients, policies, documents, reminders, analytics

### 3. Security Configuration

- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Verify RLS policies are active
- [ ] Check password requirements in Supabase Auth settings
- [ ] Enable email confirmation (recommended for production)
- [ ] Configure email templates in Supabase Auth

### 4. Performance Optimization

- [ ] Set up Redis cache (Upstash) - **Highly Recommended**
- [ ] Verify cache TTLs in `utils/redisCache.js`
- [ ] Test query performance with `.limit()` on large datasets
- [ ] Enable image optimization in `next.config.js` (already configured)

### 5. Code Quality

- [ ] Run build locally: `npm run build`
- [ ] Fix any build errors/warnings
- [ ] Test all critical flows:
  - [ ] User registration/login
  - [ ] Add/edit/delete client
  - [ ] Add/edit/delete policy
  - [ ] Upload/view/delete document
  - [ ] View dashboard analytics
- [ ] Check error boundary works: Visit `/api/test-error` (create this endpoint for testing)

---

## 🌐 Deployment Platforms

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs

**Steps:**

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (recommended):
   - Push code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Configure environment variables
   - Deploy!

3. **Deploy via CLI**:
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy to production
   vercel --prod
   ```

4. **Configure Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Make sure to select "Production" environment

5. **Custom Domain** (optional):
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

### Option 2: Netlify

**Steps:**

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy**:
   - Connect GitHub repo at [netlify.com](https://netlify.com)
   - Configure environment variables
   - Deploy

---

### Option 3: Self-Hosted (VPS/Dedicated Server)

**Requirements:**
- Node.js 18+ installed
- PM2 for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Install Dependencies**:
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and Build**:
   ```bash
   git clone your-repo-url
   cd insuredesk
   npm install
   npm run build
   ```

3. **Create `.env.local`**:
   ```bash
   cp .env.example .env.local
   nano .env.local  # Add your production values
   ```

4. **Start with PM2**:
   ```bash
   # Start application
   pm2 start npm --name "insuredesk" -- start
   
   # Save PM2 configuration
   pm2 save
   
   # Auto-start on reboot
   pm2 startup
   ```

5. **Configure Nginx**:
   ```nginx
   # /etc/nginx/sites-available/insuredesk
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable SSL** (Let's Encrypt):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 4: Docker Container

**Create `Dockerfile`**:
```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV production
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Create `docker-compose.yml`**:
```yaml
version: '3.8'

services:
  insuredesk:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Deploy**:
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 Post-Deployment

### 1. Verify Deployment

- [ ] Visit your production URL
- [ ] Check `/api/health` endpoint returns healthy status
- [ ] Test user registration and login
- [ ] Test all CRUD operations
- [ ] Upload a document and verify it works
- [ ] Check dashboard loads correctly

### 2. Monitoring Setup

**Health Check Monitoring:**
```bash
# Use UptimeRobot, Pingdom, or similar
# Monitor: https://your-domain.com/api/health
```

**Error Tracking** (Optional - Sentry):
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Add DSN to .env.local
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 3. Performance Monitoring

- [ ] Check page load times
- [ ] Verify Redis cache is working (if enabled)
- [ ] Monitor API response times
- [ ] Check Supabase dashboard for slow queries

### 4. Security Checks

- [ ] Test authentication flows
- [ ] Verify RLS policies work (try accessing other agent's data)
- [ ] Check HTTPS is enforced
- [ ] Verify security headers: [securityheaders.com](https://securityheaders.com)
- [ ] Test Cross-Origin Resource Sharing (CORS)

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions (Vercel)

**Create `.github/workflows/deploy.yml`**:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Performance Benchmarks

**Expected Performance (with Redis):**
- Page load: 0.3-0.5s
- API response: 50-200ms
- Cache hit rate: >80%
- Time to Interactive: <1s

**Without Redis:**
- Page load: 2-3s
- API response: 500ms-2s
- Still functional, just slower

---

## 🐛 Troubleshooting Production Issues

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

- Check variables are set in platform dashboard
- Restart deployment after changing variables
- Verify variable names match exactly
- Check `/api/health` for configuration status

### Database Connection Issues

- Verify Supabase URL and key are correct
- Check Supabase project is not paused (free tier)
- Verify RLS policies don't block legitimate requests
- Check Supabase logs in dashboard

### Performance Issues

- Enable Redis cache if not already
- Check Supabase query performance
- Add database indexes (see migrations)
- Enable image optimization
- Check for N+1 query problems

### 500 Internal Server Error

- Check application logs
- Visit `/api/health` for diagnostic info
- Check Supabase is operational
- Verify environment variables are set

---

## 📞 Support

- **Documentation**: See main [README.md](README.md)
- **Migrations**: See [migrations/README.md](migrations/README.md)
- **Issues**: Check deployment platform logs first
- **Supabase**: Check status at [status.supabase.com](https://status.supabase.com)

---

## ✅ Production Checklist Summary

Basic (Required):
- [x] Environment variables configured
- [x] Supabase database set up
- [x] All migrations run
- [x] Build succeeds locally
- [x] Tests pass

Security (Critical):
- [x] HTTPS enabled
- [x] RLS policies active
- [x] Environment variables secret
- [x] Security headers configured

Performance (Recommended):
- [ ] Redis cache enabled
- [ ] Images optimized
- [ ] Monitoring configured
- [ ] Health checks active

Optional (Nice to have):
- [ ] Custom domain
- [ ] Error tracking (Sentry)
- [ ] Analytics
- [ ] Automated backups

---

**🎉 Ready to Deploy!**

Choose your platform, follow the steps above, and your InsureDesk instance will be live in minutes.
