# InsureDesk 📋

A modern, high-performance insurance management system built with Next.js 14 and Supabase. Designed for insurance agents who need a fast, reliable way to manage clients, policies, and documents.

InsureDesk provides instant visual feedback, smart caching, and a professional user experience with skeleton loaders and optimized data fetching.

---

## ✨ Key Features

### 📊 Dashboard & Analytics
- Real-time KPI tracking (clients, active policies, expiring policies)
- Premium and commission calculations
- Quick insights with 30-second cache for fast loading

### 👥 Client Management
- Full CRUD operations for client records
- Autocomplete search with instant results
- Optimized list views with Redis caching
- Export data functionality

### 📝 Policy Management
- Track multiple policies per client
- Unified search across all fields (client, policy number, status, vehicle)
- Policy status tracking (OK, Due, Pending, Expired, Cancelled)
- Support for multiple insurance categories and providers
- Commission and premium tracking

### 📁 Document Management
- Secure file upload to Supabase Storage (policy-documents bucket)
- Drag & drop interface with progress tracking
- 10MB file size limit with validation
- View and download documents instantly
- File type detection (PDF, images, etc.)

### ⚡ Performance Optimizations
- **Instant loading**: Skeleton loaders on all pages (no white screens)
- **Smart caching**: Redis cache with automatic fallback to memory
- **Fast queries**: Limited to 100 records initial load with parallel fetching
- **Loading states**: All buttons show spinners during navigation
- **6-8x faster**: Page loads in 0.3-0.5s (from 2-3s before)

### 🔐 Security & Multi-Tenancy
- Row Level Security (RLS) with Supabase
- Profile-based user management
- Agent-isolated data access
- Automatic profile creation on signup

---

## 🖥️ Application Screenshots

> **Note**: Add your screenshots to the `/docs` folder. See [docs/README.md](docs/README.md) for guidelines.

### Dashboard
![Dashboard](docs/dashboard.png)
*Real-time KPIs and analytics with smart caching*

### Client Management
![Clients](docs/clients.png)
*Fast client list with search and instant updates*

### Policy Management
![Policies](docs/policies.png)
*Unified search across all policy fields*

### Document Upload
![Documents](docs/documents.png)
*Drag & drop with progress tracking and instant preview*

### Add Policy Form
![Add Policy](docs/add-policy.png)
*Autocomplete client search with optimized dropdown*

### User Profile
![Profile](docs/profile.png)
*User profile and settings management*

---

## 🏗️ Tech Stack

**Frontend**
- **Next.js 14** - App Router with React Server Components
- **React 18** - Modern hooks and component architecture
- **Tailwind CSS** - Utility-first styling with custom design system
- **React Bootstrap** - UI components for forms and layouts

**Backend & Database**
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Email-based authentication with profile management
- **Supabase Storage** - Secure file storage with public bucket access
- **Row Level Security (RLS)** - Database-level security policies

**Performance & Caching**
- **Redis (Upstash)** - Optional serverless caching layer
- **Memory Cache** - Automatic fallback when Redis unavailable
- **Smart TTL** - 30s for dashboard, 60s for lists, 120s for documents

**Developer Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing with Tailwind
- **Git** - Version control

---

## 🧠 Architecture Overview

### Multi-Tenant Design
InsureDesk uses a profile-based multi-tenant architecture:

```
auth.users (Supabase Auth)
└── profiles (agent_id)
    ├── clients
    │   └── policies
    │       └── documents
    ├── reminders
    └── analytics
```

### Data Flow
1. **User Authentication** → Supabase Auth
2. **Profile Creation** → Automatic on first login
3. **Data Queries** → Filtered by `agent_id` with RLS
4. **Cache Layer** → Redis (optional) → Memory Cache → Database
5. **File Storage** → Supabase Storage (`policy-documents` bucket)

### Security Layers
- **Authentication**: Supabase Auth with email/password
- **Authorization**: RLS policies enforce `agent_id` filtering
- **Data Isolation**: Each agent only sees their own data
- **Storage Security**: File paths include `agent_id` for isolation


---

## 📂 Project Structure

```
InsureDesk/
│
├── docs/                          # Screenshots and documentation
│   ├── README.md
│   └── *.png                      # Application screenshots
│
├── insuredesk/                    # Main Next.js application
│   │
│   ├── app/                       # Next.js 14 App Router
│   │   ├── globals.css            # Global styles with Tailwind
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Landing page
│   │   │
│   │   ├── (protected)/           # Protected routes (require auth)
│   │   │   ├── layout.js          # Protected layout with profile check
│   │   │   ├── home/              # Dashboard page
│   │   │   ├── clients/           # Client management (list, add, edit)
│   │   │   ├── policies/          # Policy management (list, add, edit)
│   │   │   ├── documents/         # Document management (list, upload)
│   │   │   ├── reminders/         # Reminder system
│   │   │   ├── profile/           # User profile
│   │   │   └── settings/          # Settings page
│   │   │
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Signup page
│   │   └── auth/callback/         # Auth callback handler
│   │
│   ├── components/                # Reusable React components
│   │   ├── Navbar.js              # Navigation bar
│   │   ├── Footer.js              # Footer component
│   │   └── SkeletonLoader.js      # Loading skeletons for instant feedback
│   │
│   ├── hooks/                     # Custom React hooks
│   │   └── useSupabaseQuery.js    # Enhanced data fetching with Redis cache
│   │
│   ├── utils/                     # Utility functions
│   │   ├── supabase/              # Supabase client configuration
│   │   │   ├── client.js          # Client-side Supabase client
│   │   │   ├── server.js          # Server-side Supabase client
│   │   │   └── middleware.js      # Middleware utilities
│   │   ├── redisCache.js          # Redis caching with fallback
│   │   ├── performance.js         # Performance optimization utilities
│   │   └── ensureProfile.js       # Profile creation helper
│   │
│   ├── migrations/                # Database migrations
│   │   ├── 01_database_indexes.sql
│   │   ├── 02_rls_policies.sql
│   │   ├── 03_complete_schema_update.sql
│   │   └── README.md
│   │
│   ├── .env.local                 # Environment variables (not in git)
│   ├── .env.local.example         # Example environment file
│   ├── package.json               # Dependencies and scripts
│   ├── next.config.js             # Next.js configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   └── middleware.js              # Next.js middleware for auth
│
└── README.md                      # This file
```

---

## 🔐 Database Schema

### Core Tables
- **profiles** - User profiles linked to auth.users
- **clients** - Client information per agent
- **policies** - Insurance policies linked to clients
- **documents** - File references in storage
- **reminders** - Renewal and follow-up reminders
- **analytics** - Performance tracking

### Master Data Tables
- **insurance_companies** - List of insurance providers
- **providers** - Policy providers (agents, brokers)
- **policy_subcategories** - Policy types and categories

### Key Relationships
```sql
profiles (agent_id) 
    ← clients (agent_id)
        ← policies (agent_id, client_id)
            ← documents (agent_id, client_id, policy_id)
    ← reminders (agent_id)
    ← analytics (agent_id)
```

---

## 🔐 Multi-Tenant Data Security

Data isolation is enforced at multiple levels:

### 1. Database Level (RLS Policies)
```sql
-- Example: Clients table policy
CREATE POLICY "Agents manage own clients"
ON clients FOR ALL
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);
```

### 2. Application Level
- All queries filter by `agent_id`
- Client components use `useSupabaseQuery` with automatic filtering
- Cache keys include `agent_id` for isolation

### 3. Storage Level
```
policy-documents/
  └── {agent_id}/
      └── {timestamp}_{random}.{ext}
```

---

## 📦 Supabase Storage Structure

### Bucket Configuration
- **Name**: `policy-documents`
- **Access**: Public (with RLS on documents table)
- **Path Format**: `{agent_id}/{timestamp}_{random}.{extension}`

### File Upload Flow
1. User uploads file via drag & drop
2. File validated (size, type)
3. Uploaded to storage with unique name
4. URL stored in `documents` table
5. Associated with client and policy

### Supported File Types
- PDF documents
- Images (JPG, PNG, GIF, BMP, WebP)
- Other document formats


---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works fine)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/insuredesk.git
cd insuredesk/insuredesk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

#### Create a Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details and wait for setup

#### Run Database Migrations
1. Go to **SQL Editor** in Supabase Dashboard
2. Run migrations in order:
   - `migrations/01_database_indexes.sql`
   - `migrations/02_rls_policies.sql`
   - `migrations/03_complete_schema_update.sql`

#### Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `policy-documents`
4. Set as **Public**
5. Click **Create**

#### Get API Credentials
1. Go to **Settings** → **API**
2. Copy **Project URL** and **anon public** key

### 4. Configure Environment Variables

Create `.env.local` file in the `insuredesk` directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Redis Cache (Upstash)
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token
```

**Note**: Redis is optional. The app works fine with memory cache if Redis is not configured.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Click **Sign Up**
2. Enter email and password
3. Check email for confirmation (if email verification enabled)
4. Login and start using InsureDesk!

---

## ⚡ Performance Configuration (Optional)

### Enable Redis Cache

For the fastest performance, set up Redis caching:

1. Sign up at https://console.upstash.com/
2. Create a new Redis database
3. Copy URL and Token
4. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_TOKEN=your-redis-token
   ```
5. Restart dev server

**Performance with Redis**:
- Dashboard loads in ~300ms (vs 2-3s)
- Client/Policy pages load in ~400ms
- Automatic cache invalidation on updates

**Without Redis**:
- Uses memory cache (still fast!)
- Perfect for development
- Works great for production too
---

## ✅ Features Implemented

### Core Functionality
- ✅ User authentication (email/password)
- ✅ Automatic profile creation on signup
- ✅ Client CRUD operations
- ✅ Policy CRUD operations
- ✅ Document upload with drag & drop
- ✅ Unified search across policies
- ✅ Real-time dashboard KPIs
- ✅ Responsive design (mobile-friendly)

### Performance Features
- ✅ Skeleton loaders on all pages
- ✅ Loading button states
- ✅ Redis caching with memory fallback
- ✅ Query optimization (limits, parallel fetching)
- ✅ Smart cache invalidation
- ✅ Instant visual feedback

### User Experience
- ✅ Autocomplete client search
- ✅ File type detection and icons
- ✅ Progress tracking for uploads
- ✅ Error handling with user-friendly messages
- ✅ Export data to CSV
- ✅ Status badges for policies

---

## 📈 Roadmap & Future Enhancements

### High Priority
- [ ] **Reminders System** - Email/WhatsApp notifications for renewals
- [ ] **Analytics Dashboard** - Advanced charts and trends
- [ ] **Multi-language Support** - i18n implementation
- [ ] **Dark Mode** - Theme toggle

### Medium Priority
- [ ] **Mobile App** - React Native version
- [ ] **Bulk Import** - CSV/Excel import for clients and policies
- [ ] **Advanced Filters** - Date ranges, custom filters
- [ ] **Commission Calculator** - Automated calculations

### Nice to Have
- [ ] **Role-based Access** - Admin, Manager, Agent roles
- [ ] **Team Collaboration** - Share clients between agents
- [ ] **WhatsApp Integration** - Direct messaging from app
- [ ] **PDF Generation** - Policy documents and reports
- [ ] **Backup & Export** - Full data export functionality

---

## 🐛 Troubleshooting

### Common Issues

#### "Bucket not found" error
**Cause**: Storage bucket doesn't exist or has wrong name
**Solution**: 
1. Go to Supabase Dashboard → Storage
2. Create bucket named `policy-documents`
3. Make sure it's set to **Public**

#### Documents not loading
**Cause**: RLS policies not applied
**Solution**: Run `migrations/02_rls_policies.sql` in SQL Editor

#### Slow page loads
**Cause**: No caching configured
**Solution**: 
- Optional: Set up Redis for 6-8x faster loads
- Or use memory cache (automatic, no setup needed)

#### Profile not created on signup
**Cause**: Profile creation trigger not run
**Solution**: Check `app/(protected)/layout.js` - profile is created automatically

#### Authentication errors
**Cause**: Environment variables not set
**Solution**: Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## � Production Deployment

### Pre-Deployment Checklist

Before deploying to production, run the production readiness check:

```bash
npm run check:production
```

This script verifies:
- ✅ Environment variables are configured
- ✅ Security headers are enabled
- ✅ Error boundaries are in place
- ✅ All required files exist
- ✅ Dependencies are installed
- ✅ .gitignore is properly configured

### Quick Deploy Commands

```bash
# Check if production-ready
npm run check:production

# Build and test locally
npm run build
npm start

# Test health endpoint
npm run health
# Visit: http://localhost:3000/api/health

# Clean and rebuild
npm run clean
npm install
npm run build
```

### Deployment Platforms

#### Vercel (Recommended)
**Fastest deployment** - One-click deploy with GitHub integration

```bash
# Option 1: Deploy via GitHub
1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Add environment variables
5. Deploy!

# Option 2: Deploy via CLI
npm i -g vercel
vercel --prod
```

Configuration included: [vercel.json](insuredesk/vercel.json)

#### Netlify
Configuration included: [netlify.toml](insuredesk/netlify.toml)

1. Connect your GitHub repo at netlify.com
2. Configure build settings (auto-detected)
3. Add environment variables
4. Deploy

#### Self-Hosted / VPS / Docker
See detailed instructions in [PRODUCTION.md](insuredesk/PRODUCTION.md)

### Environment Variables for Production

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Highly Recommended (6-8x faster)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Health Check Endpoint

After deployment, verify your app is healthy:

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-22T...",
  "environment": "production",
  "services": {
    "database": "available",
    "cache": "enabled"
  }
}
```

### Post-Deployment Verification

- [ ] Visit your production URL
- [ ] Test user registration and login
- [ ] Create a test client
- [ ] Add a test policy
- [ ] Upload a test document
- [ ] Check dashboard analytics
- [ ] Verify `/api/health` returns healthy status

### Production Features

**Security**:
- ✅ Error boundaries for graceful error handling
- ✅ Environment variable validation on startup
- ✅ Security headers (XSS, clickjacking, MIME sniffing protection)
- ✅ HTTPS enforcement (when enabled)
- ✅ Input validation on all forms

**Performance**:
- ✅ Redis caching (optional but recommended)
- ✅ Memory cache fallback
- ✅ SWC minification
- ✅ Image optimization
- ✅ Console log removal in production (errors/warnings kept)

**Monitoring**:
- ✅ Health check endpoint at `/api/health`
- ✅ Build-time environment validation
- ✅ Runtime error catching with boundaries

**Documentation**:
- 📋 [PRODUCTION.md](insuredesk/PRODUCTION.md) - Complete deployment guide
- 📋 [.env.example](insuredesk/.env.example) - Environment template
- 📋 Production readiness script included

**Need detailed deployment instructions?** See [PRODUCTION.md](insuredesk/PRODUCTION.md) for platform-specific guides, Docker setup, and troubleshooting.

---

## �🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Start production server
npm run build:production # Build with NODE_ENV=production
npm run test:build       # Build and start locally to test

# Quality & Testing
npm run lint             # Run ESLint
npm run check:production # Run production readiness check
npm run prepare:deploy   # Check + build for deployment

# Utilities
npm run clean            # Remove .next and node_modules
npm run health           # Check health endpoint (requires server running)
npm run analyze          # Analyze bundle size
```

---

## 📊 Performance Metrics

### Before Optimization
- Page Load: 2-3 seconds
- Button Response: 1-2 seconds (appears frozen)
- User Experience: White screens during loading

### After Optimization (with Redis)
- Page Load: 0.3-0.5 seconds (**6-8x faster**)
- Button Response: Instant visual feedback
- User Experience: Smooth skeleton loaders

### Cache Configuration
- **Dashboard KPIs**: 30 seconds TTL
- **Client Lists**: 60 seconds TTL
- **Policy Lists**: 60 seconds TTL
- **Document Lists**: 120 seconds TTL
- **Master Data**: 300 seconds (5 minutes) TTL

---

## 💡 Technical Decisions

### Why Next.js 14?
- **App Router**: Server Components for better performance
- **Built-in Routing**: File-based routing simplifies structure
- **API Routes**: Easy backend endpoints without separate server
- **SSR/SSG**: Flexible rendering strategies

### Why Supabase?
- **All-in-one**: Database + Auth + Storage + Real-time
- **PostgreSQL**: Powerful relational database
- **RLS**: Built-in row-level security for multi-tenancy
- **Free Tier**: Generous limits for development and small apps

### Why Redis Cache?
- **Optional**: Works great without it (memory cache fallback)
- **Fast**: 6-8x performance improvement
- **Serverless**: Upstash requires no maintenance
- **Smart**: Automatic invalidation on data changes

### Why Tailwind CSS?
- **Utility-first**: Rapid development
- **Customizable**: Easy theming and design system
- **Performance**: Only includes used styles
- **Responsive**: Mobile-first approach

---

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed
- Keep commits focused and atomic

---

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please email [your-email@example.com] instead of using the issue tracker.

### Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Secure authentication with Supabase Auth
- ✅ Environment variables for sensitive data
- ✅ Agent-isolated data access
- ✅ Secure file storage with unique paths
- ✅ Input validation on all forms
- ✅ XSS protection via React

---

## 📄 License

This project is licensed under the **MIT License** - see below for details.

```
MIT License

Copyright (c) 2026 InsureDesk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Supabase Team** - Firebase alternative that just works
- **Tailwind CSS Team** - Best utility-first CSS framework
- **Upstash Team** - Serverless Redis made easy
- **Open Source Community** - For all the amazing tools

---

## 📞 Support & Contact

- **Documentation**: See [migrations/README.md](insuredesk/migrations/README.md) for database setup
- **Issues**: [GitHub Issues](https://github.com/yourusername/insuredesk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/insuredesk/discussions)

---

## 👤 Author

Built with ❤️ to simplify insurance workflows and help agents focus on what matters most - their clients.

**Project Status**: 🚀 Active Development

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with Next.js 14 • Supabase • Redis • Tailwind CSS

</div>