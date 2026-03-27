'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Droplets, BarChart3, Users, Hospital, AlertCircle, Menu, X, LogOut, Settings } from 'lucide-react';
import { useSupabase } from '@/providers/supabase-provider';
import { type Profile } from '@/lib/supabase';
import { toast } from 'sonner';

const navigationItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/donors', label: 'Donors', icon: Users, adminOnly: false },
  { href: '/hospitals', label: 'Hospitals', icon: Hospital },
  { href: '/emergency', label: 'Emergency', icon: AlertCircle },
];

const adminItems = [
  { href: '/admin/users', label: 'Users', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-accent text-accent-foreground rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <Link href="/" className="flex items-center gap-3 mb-8 font-bold text-xl">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Droplets className="text-sidebar-primary-foreground" size={24} />
            </div>
            <span className="text-sidebar-foreground">BloodLink</span>
          </Link>

          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {profile?.role === 'super_admin' && (
              <>
                <div className="my-4 border-t border-sidebar-border" />
                <div className="px-4 py-2 text-xs font-semibold text-sidebar-foreground opacity-60 uppercase">
                  Admin
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="space-y-4 py-4 border-t border-sidebar-border">
            {profile && (
              <div className="px-4">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.full_name || 'User'}</p>
                <p className="text-xs text-sidebar-foreground opacity-60 capitalize">{profile.role.replace('_', ' ')}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="hidden lg:block w-64" />
    </>
  );
}
