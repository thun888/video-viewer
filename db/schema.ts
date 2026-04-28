import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  mediaType: varchar('media_type', { length: 10 })
    .notNull()
    .default('video'),
  mediaUrl: text('media_url').notNull(),
  isM3U8: boolean('is_m3u8').notNull().default(false),
  lowLatencyMode: boolean('low_latency_mode').notNull().default(false),
  shortId: varchar('short_id', { length: 255 }).unique(),
  hash: varchar('hash', { length: 255 }).notNull().unique(),
  viewCount: integer('view_count').notNull().default(0),
  author: varchar('author', { length: 255 }).notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
