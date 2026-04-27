import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { hash } from 'bcryptjs'
import { users } from './schema'
import { eq } from 'drizzle-orm'

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL || './db/sqlite.db'
  const sqlite = new Database(DATABASE_URL)
  const db = drizzle(sqlite)

  const passwordHash = await hash('admin', 12)

  const existing = db.select().from(users).where(eq(users.username, 'admin')).get()
  if (!existing) {
    db.insert(users).values({
      username: 'admin',
      passwordHash,
      isAdmin: true,
    }).run()
    console.log('Admin user created (username: admin, password: admin)')
  } else {
    console.log('Admin user already exists')
  }
}

main()
