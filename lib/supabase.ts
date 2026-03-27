import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
)

export type Profile = {
  id: string
  full_name: string | null
  role: 'super_admin' | 'hospital_admin' | 'donor'
  hospital_id: string | null
  created_at: string
  updated_at: string
}

export type Waitlist = {
  id: string
  email: string
  name: string | null
  blood_group: string | null
  status: 'pending' | 'contacted' | 'confirmed' | 'rejected'
  created_at: string
  updated_at: string
}
