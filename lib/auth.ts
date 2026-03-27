import { supabase, type Profile } from './supabase'

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) throw signUpError

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          full_name: fullName,
          role: 'hospital_admin',
        },
      ])

    if (profileError) throw profileError
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}

export async function createUser(email: string, password: string, fullName: string, role: 'super_admin' | 'hospital_admin' | 'donor', hospitalId?: string) {
  // Sign up the user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (signUpError) throw signUpError

  if (data.user) {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          full_name: fullName,
          role,
          hospital_id: hospitalId || null,
        },
      ])

    if (profileError) throw profileError
  }

  return data.user
}

export async function joinWaitlist(email: string, name: string, bloodGroup?: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([
      {
        email,
        name,
        blood_group: bloodGroup || null,
      },
    ])
    .select()

  if (error) throw error
  return data
}
