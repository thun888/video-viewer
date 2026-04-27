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
    <div className="flex min-h-full">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
