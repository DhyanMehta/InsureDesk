# InsureDesk

A simple, practical insurance management system built for agents who need a clean way to manage clients, policies, and documents without juggling spreadsheets.

InsureDesk focuses on clarity, data ownership, and scalability. Each agent works within their own secure workspace, ensuring client data stays isolated and organized.

---

## ✨ What InsureDesk Does

- Manage clients and their details
- Track multiple policies per client
- Upload and store policy documents securely
- Monitor renewals and expirations
- View quick insights from a clean dashboard
- Keep data isolated per agent (multi-tenant)

---

## 🖥️ Dashboard Preview

> Add your screenshots in the `/docs` folder and link them below.

### Agent Dashboard
![Dashboard](docs/dashboard.png)

### Client Management
![Clients](docs/clients.png)

### Policy Module
![Policies](docs/policies.png)

---

## 🏗️ Tech Stack

**Frontend**
- React / Next.js
- Tailwind CSS
- Component-based architecture

**Backend**
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS) for multi-tenant isolation

**Storage**
- Supabase Storage for policy documents

---

## 🧠 Architecture Overview

InsureDesk follows a multi-tenant design:

- Each user = an agent
- Each agent owns their clients
- Each client can have multiple policies
- Documents are stored per policy in secure storage

Agent (auth.users)
└── Clients
└── Policies
└── Documents


---

## 📂 Project Structure (suggested)

insuredesk/
│
├── docs/ # Screenshots & assets
├── src/
│ ├── components/
│ ├── modules/
│ │ ├── clients/
│ │ ├── policies/
│ │ └── dashboard/
│ ├── services/
│ │ └── supabase.ts
│ └── utils/
│
├── supabase/
│ └── schema.sql
│
└── README.md

---

## 🔐 Multi-Tenant Data Security

Data isolation is enforced using:

- `agent_id` linked to `auth.users`
- Row Level Security (RLS) policies
- Secure storage paths per agent

This ensures agents can only access their own data.

---

## 📦 Supabase Storage Structure

policy-documents/{agent_id}/{client_id}/{policy_id}/file.pdf


---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/insuredesk.git
cd insuredesk

2. Setup Supabase

Create a Supabase project

Run the SQL schema from /supabase/schema.sql

Enable Row Level Security

Create storage bucket: policy-documents

3. Configure environment variables

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

4. Run the app
npm install
npm run dev
📈 Roadmap

Planned improvements:

Role-based access (admin / agent)

Commission tracking

Renewal notifications (email & WhatsApp)

Advanced analytics

Mobile-friendly layout

Import clients from CSV

🤝 Contributing

Contributions are welcome. If you find a bug or have an idea, feel free to open an issue or submit a pull request.

📄 License

MIT License — feel free to use and adapt.

👤 Author

Built with care to simplify insurance workflows.