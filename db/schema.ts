import {
  sqliteTable,
  text,
  integer,
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const videos = sqliteTable('videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  mediaType: text('media_type', { enum: ['video', 'audio'] })
    .notNull()
    .default('video'),
  mediaUrl: text('media_url').notNull(),
  isM3U8: integer('is_m3u8', { mode: 'boolean' }).notNull().default(false),
  lowLatencyMode: integer('low_latency_mode', { mode: 'boolean' })
    .notNull()
    .default(false),
  shortId: text('short_id').unique(),
  hash: text('hash').notNull().unique(),
  viewCount: integer('view_count').notNull().default(0),
  author: text('author').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})
