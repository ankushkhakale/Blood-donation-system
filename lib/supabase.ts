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
