import { db } from '@/db'
import { videos } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { VideoPlayer } from './video-player'
import { ArtalkComments } from '@/components/artalk-comments'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>
}): Promise<Metadata> {
  const { hash } = await params
  const video = db.select().from(videos).where(eq(videos.hash, hash)).get()
  if (!video) return { title: 'Not Found' }
  return { title: `${video.title} - Video Viewer` }
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash } = await params
  const video = db.select().from(videos).where(eq(videos.hash, hash)).get()
  if (!video) notFound()

  db.update(videos)
    .set({ viewCount: sql`view_count + 1` })
    .where(eq(videos.id, video.id))
    .run()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{video.title}</h1>

      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
        {video.author && <span>{video.author}</span>}
        <span>{new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
        <span>{(video.viewCount + 1).toLocaleString()} 次播放</span>
      </div>

      <div className="mt-6">
        <VideoPlayer
          mediaUrl={video.mediaUrl}
          mediaType={video.mediaType}
          isM3U8={video.isM3U8}
          coverUrl={video.coverUrl}
        />
      </div>

      {video.description && (
        <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{video.description}</p>
      )}

      <ArtalkComments />
    </div>
  )
}
