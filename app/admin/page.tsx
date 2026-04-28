import { db } from '@/db'
import { users, videos } from '@/db/schema'
import { count, sum } from 'drizzle-orm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '仪表盘 - Video Viewer' }

export default async function AdminDashboard() {
  const videoResult = await db.select({ count: count() }).from(videos)
  const userResult = await db.select({ count: count() }).from(users)
  const viewResult = await db.select({ total: sum(videos.viewCount) }).from(videos)

  const videoCount = videoResult[0].count
  const userCount = userResult[0].count
  const viewSum = viewResult[0].total || 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">仪表盘</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-lg border p-6">
          <div className="text-sm text-muted-foreground">视频总数</div>
          <div className="text-3xl font-bold mt-2">{videoCount}</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-sm text-muted-foreground">用户总数</div>
          <div className="text-3xl font-bold mt-2">{userCount}</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-sm text-muted-foreground">总播放量</div>
          <div className="text-3xl font-bold mt-2">{viewSum.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
