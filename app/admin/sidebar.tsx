'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions/auth'

const links = [
  { href: '/admin', label: '仪表盘' },
  { href: '/admin/videos', label: '视频管理' },
  { href: '/admin/users', label: '用户管理' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r bg-sidebar p-4 flex flex-col">
      <div className="font-semibold text-lg mb-6 px-2">Video Viewer</div>
      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm transition-colors',
              pathname === link.href ||
                (link.href !== '/admin' && pathname.startsWith(link.href))
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logout}>
        <Button variant="outline" size="sm" className="w-full">
          退出登录
        </Button>
      </form>
    </aside>
  )
}
