'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions/auth'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const links = [
  { href: '/admin', label: '仪表盘' },
  { href: '/admin/videos', label: '视频管理' },
  { href: '/admin/users', label: '用户管理' },
]

function SidebarLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 space-y-1">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== '/admin' && pathname.startsWith(link.href))

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              'block rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <div className="mb-6 px-2 text-lg font-semibold">Video Viewer</div>
      <SidebarLinks pathname={pathname} onNavigate={onNavigate} />
      <form action={logout} className="pt-4">
        <Button variant="outline" size="sm" className="w-full">
          退出登录
        </Button>
      </form>
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileOpen(true)}
          aria-label="打开侧边栏"
        >
          <PanelLeftIcon />
        </Button>
        <span className="text-sm font-semibold">后台管理</span>
      </div>

      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarBody pathname={pathname} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-56 max-w-none border-r border-sidebar-border p-0"
        >
          <SidebarBody
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
