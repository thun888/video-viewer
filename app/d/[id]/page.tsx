import { db } from '@/db'
import { videos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = db
    .select({ hash: videos.hash })
    .from(videos)
    .where(eq(videos.shortId, id))
    .get()

  if (!video) notFound()
  redirect(`/video/${video.hash}`)
}
