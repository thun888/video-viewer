import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

const DATABASE_URL = process.env.DATABASE_URL || './db/sqlite.db'

const sqlite = new Database(DATABASE_URL)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
sqlite.pragma('busy_timeout = 5000')

export const db = drizzle(sqlite)
