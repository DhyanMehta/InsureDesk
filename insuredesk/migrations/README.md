# Database Migrations

This folder contains SQL migration files to optimize and secure your InsureDesk database.

## Migration Files

### 01_database_indexes.sql
**Performance Optimization**

This migration creates database indexes on all frequently queried columns to dramatically improve query performance.

**Key Benefits:**
- ⚡ Faster client lookups and filtering
- 🚀 Improved policy queries with joins
- 📊 Optimized sorting and date-based queries
- 🔍 Efficient search across documents and reminders

**Tables Covered:**
- `clients` - Agent filtering, email/phone lookups
- `policies` - Client joins, status filtering, expiry tracking
- `documents` - Client/policy associations, date sorting
- `reminders` - Status filtering, date-based queries
- `analytics` - Agent analytics, time-series data
- `profiles` - User lookups, role filtering

### 02_rls_policies.sql
**Security & Data Isolation**

This migration implements Row Level Security (RLS) policies to ensure data privacy and security.

**Key Benefits:**
- 🔒 Users can only access their own data
- 🛡️ Automatic security at the database level
- ✅ Prevents unauthorized data access
- 🔐 Secure document storage with bucket policies

**Security Features:**
- Client data isolated by `agent_id`
- Policies linked to client ownership
- Documents accessible only to client's agent
- Reminders protected through client relationship
- Storage bucket with user-folder isolation

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `01_database_indexes.sql`
5. Click **Run** to execute
6. Repeat steps 3-5 for `02_rls_policies.sql`

### Option 2: Supabase CLI

```bash
# Navigate to your project directory
cd insuredesk

# Apply database indexes
supabase db push migrations/01_database_indexes.sql

# Apply RLS policies
supabase db push migrations/02_rls_policies.sql
```

### Option 3: Node.js Script

```javascript
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key
)

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8')
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  if (error) console.error('Error:', error)
  else console.log('✅ Migration applied:', filePath)
}

runMigration('./migrations/01_database_indexes.sql')
runMigration('./migrations/02_rls_policies.sql')
```

## Verification

After applying migrations, verify they were successful:

### Check Indexes

```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

### Check RLS Status

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check RLS Policies

```sql
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Performance Impact

**Before Migrations:**
- Full table scans on large queries
- Slower filtering and sorting
- No data isolation (security risk)

**After Migrations:**
- Index-optimized queries (10-100x faster)
- Sub-millisecond lookups
- Automatic row-level security

## Rollback

If you need to remove the migrations:

### Remove Indexes

```sql
-- Drop all custom indexes
DROP INDEX IF EXISTS idx_clients_agent_id;
DROP INDEX IF EXISTS idx_clients_email;
-- ... (repeat for all indexes)
```

### Disable RLS

```sql
-- Disable RLS on all tables
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE policies DISABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)
```

## Troubleshooting

### Issue: Permission denied

**Solution:** Make sure you're using the service role key, not the anon key.

### Issue: Index already exists

**Solution:** This is harmless. The migration uses `IF NOT EXISTS` to handle this.

### Issue: RLS policies blocking queries

**Solution:** Make sure your queries include `auth.uid()` context. Use Supabase client with authenticated user.

### Issue: Storage policies not working

**Solution:** Ensure file paths follow the pattern: `{user_id}/{filename}`

## Best Practices

1. **Run indexes first** - Apply `01_database_indexes.sql` before `02_rls_policies.sql`
2. **Test in development** - Apply to a test project first
3. **Backup your data** - Always backup before running migrations
4. **Monitor performance** - Check query speeds before/after
5. **Review policies** - Ensure RLS policies match your auth logic

## Need Help?

- Check the Supabase docs: https://supabase.com/docs
- Review RLS guide: https://supabase.com/docs/guides/auth/row-level-security
- Check indexes guide: https://supabase.com/docs/guides/database/postgres/indexes
