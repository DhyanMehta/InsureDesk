# 🔄 Supabase Keep-Alive Setup Guide

This guide will help you set up automated keep-alive pings to prevent your Supabase free tier project from pausing due to inactivity.

## 📋 Problem

**Supabase Free Tier**: Projects pause after **7 days of inactivity**. Once paused:
- Database becomes inaccessible
- API requests fail
- Users can't access your app
- You need to manually unpause in Supabase dashboard

## ✅ Solution

Automated weekly pings to keep your Supabase project active.

---

## 🚀 Setup Options

### Option 1: GitHub Actions (Recommended - FREE)

**Why GitHub Actions?**
- ✅ Completely free (2000 minutes/month, uses <1 min/week)
- ✅ Reliable scheduling
- ✅ Easy to monitor logs
- ✅ No additional services needed

**Setup Steps:**

#### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add Supabase keep-alive system"
git push origin main
```

#### 2. Add GitHub Secrets

Go to your GitHub repository:

1. Click `Settings` tab
2. Go to `Secrets and variables` → `Actions`
3. Click `New repository secret`

Add these 3 secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API |
| `DEPLOYED_URL` | `https://your-app.vercel.app` | Your deployed app URL (add after deployment) |

**Note**: `DEPLOYED_URL` is optional but recommended. Add it after deploying your app.

#### 3. Enable GitHub Actions

1. Go to `Actions` tab in your repository
2. If you see "Enable workflows", click it
3. You should see "Supabase Keep-Alive" workflow listed

#### 4. Test Manually (Optional but Recommended)

1. Go to `Actions` tab
2. Click `Supabase Keep-Alive` workflow on the left
3. Click `Run workflow` dropdown
4. Click green `Run workflow` button
5. Wait ~30 seconds and refresh
6. Click on the workflow run to see logs
7. Verify it shows "✓ Keep-Alive completed successfully!"

#### 5. Monitor

- **Automatic runs**: Every Sunday at 2:00 AM UTC
- **Check logs**: Go to Actions tab → Click workflow run → View logs
- **Email notifications**: GitHub will email you if workflow fails

---

### Option 2: Vercel Cron (If Using Vercel)

**Already configured in `vercel.json`!**

#### Setup Steps:

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Verify Cron Job**:
   - Go to Vercel Dashboard
   - Select your project
   - Go to `Settings` → `Cron Jobs`
   - You should see: `GET /api/cron/keep-alive` (weekly)

3. **Add Environment Variables** (if not already set):
   - Go to `Settings` → `Environment Variables`
   - Add: `NEXT_PUBLIC_SUPABASE_URL`
   - Add: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**That's it!** Vercel will automatically run the cron job weekly.

---

### Option 3: External Cron Services

If you prefer external services:

#### A. cron-job.org (Free)

1. Sign up at https://cron-job.org
2. Create new cron job:
   - **URL**: `https://your-app.vercel.app/api/cron/keep-alive`
   - **Schedule**: Every 7 days
   - **HTTP Method**: GET
3. Save and enable

#### B. EasyCron (Free tier available)

1. Sign up at https://www.easycron.com
2. Create cron job:
   - **URL**: `https://your-app.vercel.app/api/cron/keep-alive`
   - **Schedule**: `0 2 * * 0` (Every Sunday at 2 AM)
3. Enable

#### C. UptimeRobot (Free)

1. Sign up at https://uptimerobot.com
2. Add new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-app.vercel.app/api/health`
   - **Interval**: 5 minutes (keeps both app and DB active)
3. Save

---

### Option 4: Local Cron (Linux/Mac Only)

**For development or self-hosted:**

```bash
# Open crontab editor
crontab -e

# Add this line (runs every Sunday at 2 AM)
0 2 * * 0 cd /path/to/insuredesk && npm run keep-alive

# Save and exit
```

**Windows Task Scheduler:**

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Weekly, Sunday, 2:00 AM
4. Action: Start a program
   - Program: `node`
   - Arguments: `scripts/keep-alive.js`
   - Start in: `D:\Dhyan\Self Projects\InsureDesk\insuredesk`

---

## 🧪 Testing

### Test Manually:

```bash
cd insuredesk
npm run keep-alive
```

**Expected output:**
```
[2026-02-22T...] Starting Supabase Keep-Alive process...
[2026-02-22T...] ============================================================
[2026-02-22T...] Pinging Supabase database...
[2026-02-22T...] ✓ Supabase database is active
[2026-02-22T...] Pinging app health endpoint: https://your-app.vercel.app/api/health
[2026-02-22T...] ✓ App is healthy (status: healthy)
[2026-02-22T...] ============================================================
[2026-02-22T...] ✓ Keep-Alive completed successfully!
```

### Check Logs:

```bash
# View keep-alive.log
cat insuredesk/keep-alive.log

# Or on Windows
type insuredesk\keep-alive.log
```

---

## 📊 Monitoring

### GitHub Actions Logs

1. Go to repository Actions tab
2. Click on a workflow run
3. Expand "Run Keep-Alive Script" step
4. View detailed logs

### Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Check `Settings` → `General`
4. Look for "Project Status" - should always be "Active"

### Email Notifications

GitHub Actions will email you if:
- Workflow fails
- Supabase connection fails
- Any errors occur

---

## 🔧 Customization

### Change Schedule

Edit `.github/workflows/keep-alive.yml`:

```yaml
schedule:
  # Every 3 days at 2 AM
  - cron: '0 2 */3 * *'
  
  # Daily at 3 AM
  - cron: '0 3 * * *'
  
  # Twice per week (Sunday and Wednesday)
  - cron: '0 2 * * 0,3'
```

**Cron Format**: `minute hour day month weekday`

### Add More Checks

Edit `scripts/keep-alive.js`:

```javascript
// Add custom database query
async function pingSupabase() {
  // ... existing code ...
  
  // Query a specific table to ensure it's responsive
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  
  // ... rest of code ...
}
```

---

## ❓ Troubleshooting

### Issue: "Missing Supabase credentials"

**Solution**: Ensure environment variables are set:
- In GitHub: Check Secrets are added correctly
- In Vercel: Check Environment Variables
- Locally: Check `.env.local` file exists

### Issue: "Workflow not running"

**Solutions**:
1. Check if Actions are enabled: `Settings` → `Actions` → `General`
2. Verify workflow file is in `.github/workflows/` folder
3. Check branch protection rules aren't blocking Actions
4. Try manual trigger from Actions tab

### Issue: "Supabase ping failed: 401"

**Solution**: Invalid Supabase key
- Go to Supabase Dashboard → Settings → API
- Copy fresh "anon public" key
- Update in GitHub Secrets / Environment Variables

### Issue: "Health endpoint unavailable"

**Solution**: Deploy your app first
- Deploy to Vercel/Netlify
- Add `DEPLOYED_URL` secret with your app URL
- Or remove health endpoint check (only Supabase ping is critical)

### Issue: "Keep-alive.log not found"

**Solution**: Log file is created on first run
```bash
# Create it manually if needed
touch insuredesk/keep-alive.log
```

---

## 📈 Best Practices

### 1. Use Multiple Methods

Combine GitHub Actions + Vercel Cron for redundancy:
- Primary: GitHub Actions (reliable)
- Backup: Vercel Cron (automatic)

### 2. Monitor Regularly

- Check GitHub Actions logs weekly
- Set up email notifications
- Monitor Supabase dashboard

### 3. Test After Changes

Always test after modifying:
```bash
npm run keep-alive
```

### 4. Keep Logs Clean

Logs can grow large over time:
```bash
# Clear old logs (keep last month)
# Add to keep-alive.js or run manually
find . -name "keep-alive.log" -mtime +30 -delete
```

### 5. Document Your Schedule

Add comment to `.github/workflows/keep-alive.yml`:
```yaml
# Runs every Sunday at 2 AM UTC
# Supabase free tier pauses after 7 days
# This keeps project active
```

---

## 🎯 Recommended Setup

**For production apps:**

1. ✅ **Use GitHub Actions** (primary method)
   - Add secrets
   - Test manually first
   - Enable email notifications

2. ✅ **Add Vercel Cron** (backup)
   - Already configured
   - Automatic once deployed

3. ✅ **Monitor weekly**
   - Check Actions tab
   - Verify in Supabase dashboard

4. ✅ **Set reminders**
   - Calendar reminder to check monthly
   - Ensure keep-alive is working

---

## 📝 Summary

| Method | Cost | Reliability | Setup Difficulty |
|--------|------|-------------|-----------------|
| GitHub Actions | FREE | ⭐⭐⭐⭐⭐ | Easy |
| Vercel Cron | FREE | ⭐⭐⭐⭐⭐ | Very Easy |
| cron-job.org | FREE | ⭐⭐⭐⭐ | Medium |
| UptimeRobot | FREE | ⭐⭐⭐⭐⭐ | Medium |
| Local Cron | FREE | ⭐⭐⭐ | Medium |

**Recommended**: GitHub Actions + Vercel Cron (both free, highly reliable)

---

## 🆘 Support

**If keep-alive fails:**

1. Check GitHub Actions logs
2. Verify Supabase credentials
3. Test manually: `npm run keep-alive`
4. Check Supabase project status in dashboard

**If Supabase still pauses:**

1. Go to Supabase Dashboard
2. Select your project
3. Click "Restore" or "Resume"
4. Check why keep-alive failed
5. Fix the issue and test again

---

## ✅ Verification Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Secrets added (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] GitHub Actions enabled
- [ ] Manual test run successful
- [ ] Workflow scheduled (every Sunday)
- [ ] Email notifications configured
- [ ] Logs monitoring set up
- [ ] (Optional) Vercel Cron configured
- [ ] (Optional) External monitor added as backup

---

**Your Supabase project will now stay active indefinitely!** 🎉

The keep-alive system will automatically ping your database every week, preventing it from pausing due to inactivity.
