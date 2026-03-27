# 🩸 Blood Donation Management System

A modern web app to connect donors, hospitals, and administrators with real-time blood availability, emergency requests, and role-based workflows. Built with the Next.js App Router, Supabase for auth/data, and a component-rich UI powered by Tailwind CSS and Radix.

## ✨ Features

- Donor onboarding, waitlist, and profile management
- Hospital dashboard for stock, requests, and user administration
- Emergency feed for urgent blood requests and status tracking
- Blood availability grid and analytics-style stat cards
- Role-based access (super admin, hospital admin, donor)
- Responsive, dark-mode friendly UI with reusable components

## 🧰 Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Auth & Database:** Supabase
- **Styling:** Tailwind CSS 4, shadcn/ui primitives (Radix UI)
- **Charts & UI:** Recharts, Lucide icons, Sonner toasts
- **Forms & Validation:** React Hook Form, Zod

## 📂 Project Structure

```
Blood-donation-system/
├── app/                 # App Router routes (landing, login, donors, hospitals, emergency, admin)
├── components/          # Feature and UI components (tables, forms, charts, sidebar, etc.)
├── hooks/               # Reusable React hooks (toast, mobile)
├── lib/                 # Supabase types, auth helpers, utilities
├── providers/           # Supabase provider
├── scripts/             # SQL to init/auth/seed Supabase
├── styles/              # Global styles
├── public/              # Static assets
├── middleware.ts        # App-wide middleware
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 18.17** (Next.js 16 requirement)
- pnpm (recommended) or npm/yarn
- Supabase project (for auth + database)

### Setup

1) **Clone & install dependencies**

```bash
pnpm install
```

2) **Configure environment variables** (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# Optional (if you run server-side admin tasks)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role
```

3) **Bootstrap the database** (Supabase SQL editor)

- Run `scripts/auth-schema.sql` to set up auth-related tables/policies if needed.
- Run `scripts/init-database.sql` for core tables (profiles, hospitals, inventory, requests, etc.).
- (Optional) Run `scripts/seed-demo-user.sql` to create a demo admin/user.

4) **Run the dev server**

```bash
pnpm dev
```

Visit http://localhost:3000

### Available scripts

- `pnpm dev` — start Next.js in development
- `pnpm build` — production build
- `pnpm start` — run the built app
- `pnpm lint` — lint the codebase

## 🧪 Testing & Quality

No automated tests are defined yet. Lint with `pnpm lint` before commits; consider adding Vitest/Playwright for unit/E2E coverage.

## 🔒 Environment & Auth Notes

- Supabase is required; missing env vars will throw at startup (see `providers/supabase-provider.tsx`).
- Roles supported: `super_admin`, `hospital_admin`, `donor` (see `lib/auth.ts`). Ensure your RLS policies align with these roles.

## 🗺️ Roadmap ideas

- Location-based donor matching and proximity alerts
- Real-time stock updates and push notifications
- Offline/mobile-first donor check-in
- Audit logs and granular admin roles

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Commit with context (`git commit -m "feat: add hospital filters"`)
4. Open a Pull Request

## 📜 License

No license specified yet. Add one if you plan to distribute or deploy publicly.

## 👤 Author

[Ankush Khakale](https://github.com/ankushkhakale)
