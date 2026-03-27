'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { type Profile } from '@/lib/supabase/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'hospital_admin' as const,
    hospitalId: '',
  })

  useEffect(() => {
    loadUsers()
    loadHospitals()
  }, [])

  async function loadUsers() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadHospitals() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name')
        .order('name')

      if (error) throw error
      setHospitals(data || [])
    } catch (error) {
      console.error('Failed to load hospitals:', error)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.fullName,
              role: formData.role,
              hospital_id: formData.hospitalId || null,
            },
          ])

        if (profileError) throw profileError

        toast.success(`User created successfully!`)
        setFormData({
          email: '',
          password: '',
          fullName: '',
          role: 'hospital_admin',
          hospitalId: '',
        })
        setOpen(false)
        loadUsers()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <p className="text-muted-foreground mt-2">Create and manage system users</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Create New User
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Full Name
              </label>
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Role
              </label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'hospital_admin' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Hospital (Optional)
                </label>
                <Select value={formData.hospitalId} onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !formData.email || !formData.password || !formData.fullName}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.id}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.hospital_id ? 'Assigned' : 'None'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
