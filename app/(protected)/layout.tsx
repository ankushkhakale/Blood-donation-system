import { SidebarWrapper } from '@/components/sidebar-wrapper'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarWrapper />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
