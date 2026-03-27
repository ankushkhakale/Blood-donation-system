import { createClient } from '@/lib/supabase/client'

/**
 * Hook for using Supabase client in Client Components.
 * Always call this within a Client Component ('use client').
 * 
 * Example:
 * 'use client'
 * 
 * export function MyComponent() {
 *   const supabase = useSupabase()
 *   const { data } = await supabase.from('table').select('*')
 * }
 */
export function useSupabase() {
  return createClient()
}
