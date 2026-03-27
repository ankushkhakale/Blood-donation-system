'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplets, BarChart3, Users, Hospital, AlertCircle, Menu, X } from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/donors', label: 'Donors', icon: Users },
  { href: '/hospitals', label: 'Hospitals', icon: Hospital },
  { href: '/emergency', label: 'Emergency', icon: AlertCircle },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
          </nav>

          <div className="text-xs text-sidebar-foreground opacity-60 py-4 border-t border-sidebar-border">
            BloodLink v1.0
          </div>
        </div>
      </aside>

      <div className="hidden lg:block w-64" />
    </>
  );
}
