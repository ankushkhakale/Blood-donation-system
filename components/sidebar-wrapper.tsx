'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

const PUBLIC_ROUTES = ['/login', '/landing']

export function SidebarWrapper() {
  const pathname = usePathname()
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return null
  }

  return <Sidebar />
}
