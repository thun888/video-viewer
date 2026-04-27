import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { videos } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const videoId = parseInt(id)

  if (isNaN(videoId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const video = db.select().from(videos).where(eq(videos.id, videoId)).get()
  if (!video) {
    return Response.json({ error: 'Video not found' }, { status: 404 })
  }

  return Response.json(video)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const videoId = parseInt(id)

  if (isNaN(videoId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const existing = db.select().from(videos).where(eq(videos.id, videoId)).get()
  if (!existing) {
    return Response.json({ error: 'Video not found' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, coverUrl, mediaType, mediaUrl, isM3U8, lowLatencyMode, shortId, author } = body

  if (shortId && shortId !== existing.shortId) {
    const conflict = db.select({ id: videos.id }).from(videos).where(eq(videos.shortId, shortId)).get()
    if (conflict) {
      return Response.json({ error: 'Short ID already exists' }, { status: 409 })
    }
  }

  db.update(videos)
    .set({
      title: title ?? existing.title,
      description: description !== undefined ? description : existing.description,
      coverUrl: coverUrl !== undefined ? coverUrl : existing.coverUrl,
      mediaType: mediaType ?? existing.mediaType,
      mediaUrl: mediaUrl ?? existing.mediaUrl,
      isM3U8: isM3U8 !== undefined ? !!isM3U8 : existing.isM3U8,
      lowLatencyMode: lowLatencyMode !== undefined ? !!lowLatencyMode : existing.lowLatencyMode,
      shortId: shortId !== undefined ? (shortId || null) : existing.shortId,
      author: author !== undefined ? author : existing.author,
      updatedAt: new Date(),
    })
    .where(eq(videos.id, videoId))
    .run()

  const updated = db.select().from(videos).where(eq(videos.id, videoId)).get()
  return Response.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const videoId = parseInt(id)

  if (isNaN(videoId)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const existing = db.select({ id: videos.id }).from(videos).where(eq(videos.id, videoId)).get()
  if (!existing) {
    return Response.json({ error: 'Video not found' }, { status: 404 })
  }

  db.delete(videos).where(eq(videos.id, videoId)).run()
  return Response.json({ success: true })
}
