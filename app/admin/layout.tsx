import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/login')

  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}
