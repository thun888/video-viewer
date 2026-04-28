import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { videos } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const allVideos = await db
    .select()
    .from(videos)
    .orderBy(desc(videos.createdAt))

  const total = allVideos.length
  const items = allVideos.slice(offset, offset + limit)

  return Response.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!session.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, coverUrl, mediaType, mediaUrl, isM3U8, lowLatencyMode, shortId, author } = body

  if (!title || !mediaUrl) {
    return Response.json({ error: 'Title and media URL are required' }, { status: 400 })
  }

  const hash = crypto.randomUUID()

  let finalShortId: string | null = null
  if (shortId) {
    const existing = (await db.select({ id: videos.id }).from(videos).where(eq(videos.shortId, shortId)))[0]
    if (existing) {
      return Response.json({ error: 'Short ID already exists' }, { status: 409 })
    }
    finalShortId = shortId
  }

  const [video] = await db.insert(videos).values({
    title,
    description: description || null,
    coverUrl: coverUrl || null,
    mediaType: mediaType === 'audio' ? 'audio' : 'video',
    mediaUrl,
    isM3U8: !!isM3U8,
    lowLatencyMode: !!lowLatencyMode,
    shortId: finalShortId,
    hash,
    author: author || '',
  }).returning()

  return Response.json(video, { status: 201 })
}
