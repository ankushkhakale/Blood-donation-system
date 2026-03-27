# Supabase Authentication Setup

This project uses **Supabase** for full authentication with Next.js 16, leveraging the `@supabase/ssr` package for proper session management and row-level security (RLS).

## Architecture Overview

### Authentication Flow
1. **Sign Up** (`/auth/sign-up`) - Users create accounts with email, password, and full name
2. **Email Verification** - Supabase sends confirmation email (required for session creation)
3. **Login** (`/auth/login`) - Users authenticate with email/password
4. **Protected Pages** (`/(protected)/*`) - All dashboard pages require authentication via middleware
5. **Sign Out** - Sessions are properly terminated and cookies cleared

### File Structure
```
lib/supabase/
  ├── client.ts        # Browser client using createBrowserClient
  ├── server.ts        # Server client using createServerClient
  └── proxy.ts         # Middleware for session management

app/
  ├── auth/
  │   ├── login/page.tsx              # Login page
  │   ├── sign-up/page.tsx            # Sign-up page
  │   ├── sign-up-success/page.tsx    # Email confirmation page
  │   ├── error/page.tsx              # Auth error page
  │   └── layout.tsx                  # Auth layout (no sidebar)
  ├── (protected)/
  │   ├── page.tsx                    # Dashboard
  │   ├── donors/page.tsx             # Donors page
  │   ├── hospitals/page.tsx          # Hospitals page
  │   ├── emergency/page.tsx          # Emergency page
  │   ├── admin/users/page.tsx        # Admin users
  │   └── layout.tsx                  # Protected layout (with sidebar)
  └── landing/page.tsx                # Public landing page

middleware.ts                          # Session refresh middleware
```

## Key Features

### 1. Client-Side Supabase (`/lib/supabase/client.ts`)
- Used in Client Components for database queries and auth operations
- Handles real-time subscriptions
- Non-blocking, browser-based client

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('table').select('*')
```

### 2. Server-Side Supabase (`/lib/supabase/server.ts`)
- Used in Server Components for server-side operations
- Handles cookie management automatically
- Maintains session state between requests

```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase.from('table').select('*')
```

### 3. Middleware Session Refresh (`/lib/supabase/proxy.ts` + `middleware.ts`)
- Refreshes auth tokens on every request
- Maintains cookie-based sessions
- Protects `/protected/*` routes by redirecting unauthenticated users to login
- Runs on every request (except static assets)

## How Authentication Works

### Sign-Up Flow
1. User enters email, password, and full name on `/auth/sign-up`
2. Supabase creates auth user and sends verification email
3. User profile is inserted into `public.profiles` table
4. User is redirected to sign-up success page with email confirmation message
5. After email verification, user can log in

### Login Flow
1. User enters email and password on `/auth/login`
2. Middleware intercepts request and refreshes session
3. On successful login, user is redirected to protected dashboard
4. Session is stored in HTTP-only cookies

### Protected Routes
- All pages in `app/(protected)/*` require authentication
- Middleware checks for valid session before allowing access
- Unauthenticated users are redirected to `/auth/login`
- Session state is maintained across page navigation

### Sign-Out
- User clicks "Sign Out" button in sidebar
- Session is cleared from Supabase auth
- Cookies are deleted via middleware
- User is redirected to `/auth/login`

## Database Schema

### profiles Table
Required table for storing user profiles (should already exist):
```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'donor',
  hospital_id uuid,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
```

## Environment Variables

Required environment variables (already configured in Vercel):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are automatically provided when Supabase integration is connected.

## Usage Examples

### In Client Components
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('table').select('*')
      setData(data)
    }

    fetchData()
  }, [])

  return <div>{/* render data */}</div>
}
```

### In Server Components
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select('*')

  return <div>{/* render data */}</div>
}
```

### Getting Current User
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

## Security Best Practices

1. **Email Verification Required** - Users must confirm their email before they can log in
2. **Row Level Security (RLS)** - All tables should have RLS policies enforcing `auth.uid()`
3. **HTTP-Only Cookies** - Sessions are stored in HTTP-only cookies, not localStorage
4. **Middleware Protection** - All protected routes are guarded at the middleware level
5. **No Mock Auth** - Real Supabase authentication with proper session management

## Testing Auth Locally

1. Go to `/auth/sign-up` to create a new account
2. Verify email by clicking the link sent to your email
3. Go to `/auth/login` and sign in with your credentials
4. You should be redirected to the protected dashboard
5. Click "Sign Out" to end your session

## Common Issues

### "Auth redirect issue" or redirect loops
- Check that middleware is running correctly
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Clear browser cookies and try again

### Email verification not working
- Check Supabase email settings in project settings
- Ensure `emailRedirectTo` is set correctly in sign-up form
- Check spam folder for verification email

### Session lost after page refresh
- Ensure middleware is configured correctly
- Check browser cookies for auth tokens
- Verify `setAll` method in proxy.ts is properly implemented

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
