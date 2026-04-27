import Link from 'next/link'
import { db } from '@/db'
import { videos } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '视频管理 - Video Viewer' }

export default function VideoListPage() {
  const allVideos = db.select().from(videos).orderBy(desc(videos.createdAt)).all()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">视频管理</h1>
        <Link href="/admin/videos/create" className={cn(buttonVariants())}>
          添加视频
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>播放量</TableHead>
              <TableHead>创建日期</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  暂无视频，点击"添加视频"开始
                </TableCell>
              </TableRow>
            ) : (
              allVideos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>{video.mediaType === 'audio' ? '音频' : '视频'}</TableCell>
                  <TableCell>{video.author || '-'}</TableCell>
                  <TableCell>{video.viewCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(video.createdAt).toLocaleDateString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/video/${video.hash}`}
                        target="_blank"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                      >
                        查看
                      </Link>
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                      >
                        编辑
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
