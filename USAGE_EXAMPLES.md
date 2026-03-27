# Supabase Authentication - Usage Examples

This guide provides practical examples of how to use the Supabase authentication setup in your application.

## Basic Authentication

### Getting the Current User

#### In Client Components
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function CurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>

  return <div>Welcome, {user.email}!</div>
}
```

#### In Server Components
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function CurrentUserServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not logged in</div>
  }

  return <div>Welcome, {user.email}!</div>
}
```

## User Profiles

### Loading User Profile

#### Client Component Example
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/supabase/types'

export function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>No profile found</div>

  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>Role: {profile.role}</p>
    </div>
  )
}
```

#### Server Component Example
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function UserProfileServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not logged in</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <p>Role: {profile?.role}</p>
    </div>
  )
}
```

## Database Operations

### Querying Data (with RLS)

#### Client Component
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function DonorsList() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonors = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('donors')
        .select('*')

      if (error) {
        console.error('Error:', error)
      } else {
        setDonors(data || [])
      }
      setLoading(false)
    }

    fetchDonors()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {donors.map((donor) => (
        <li key={donor.id}>{donor.name}</li>
      ))}
    </ul>
  )
}
```

#### Server Component
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DonorsListServer() {
  const supabase = await createClient()

  const { data: donors } = await supabase
    .from('donors')
    .select('*')

  return (
    <ul>
      {donors?.map((donor) => (
        <li key={donor.id}>{donor.name}</li>
      ))}
    </ul>
  )
}
```

### Real-Time Subscriptions

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function RealtimeDonors() {
  const [donors, setDonors] = useState([])

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial data
    const fetchDonors = async () => {
      const { data } = await supabase
        .from('donors')
        .select('*')
      setDonors(data || [])
    }

    fetchDonors()

    // Subscribe to changes
    const subscription = supabase
      .channel('donors')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donors' },
        (payload) => {
          console.log('Change received!', payload)
          fetchDonors() // Refresh data
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <ul>
      {donors.map((donor) => (
        <li key={donor.id}>{donor.name}</li>
      ))}
    </ul>
  )
}
```

## Inserting Data

### With User Context

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { toast } from 'sonner'

export function CreateDonorForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in')
        return
      }

      const { error } = await supabase
        .from('donors')
        .insert([
          {
            name,
            user_id: user.id,
          },
        ])

      if (error) throw error

      toast.success('Donor created!')
      setName('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error creating donor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Donor name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Donor'}
      </button>
    </form>
  )
}
```

## Authentication State

### Using the useAuth Hook

```typescript
'use client'

import { useAuth } from '@/hooks/use-auth'

export function RequiresAuth() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>

  if (!user) {
    return <div>Please log in to access this content</div>
  }

  return <div>Welcome, {user.email}!</div>
}
```

## Conditional Rendering Based on Role

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/supabase/types'

export function AdminOnly() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  if (loading) return <div>Loading...</div>

  if (profile?.role !== 'super_admin') {
    return <div>Access denied. Admin only.</div>
  }

  return <div>Welcome, admin!</div>
}
```

## Error Handling Patterns

### Sign In Example with Error Handling

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login')) {
          throw new Error('Invalid email or password')
        }
        throw error
      }

      toast.success('Logged in successfully!')
      router.push('/')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

## Performance Tips

### 1. Memoize Supabase Client
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useMemo } from 'react'

export function MyComponent() {
  const supabase = useMemo(() => createClient(), [])

  // Use supabase client...
}
```

### 2. Use Server Components for Data Fetching
```typescript
// Prefer this for initial data load
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select('*')
  return <>{/* render data */}</>
}
```

### 3. Cache Server-Side Queries
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()

  // This will be cached during the request
  const { data } = await supabase
    .from('table')
    .select('*')

  return <>{/* render data */}</>
}
```

