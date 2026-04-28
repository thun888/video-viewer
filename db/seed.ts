import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { hash } from 'bcryptjs'
import { users } from './schema'
import { eq } from 'drizzle-orm'

async function main() {
  const passwordHash = await hash('admin', 12)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db = drizzle(pool)

  const existing = await db.select().from(users).where(eq(users.username, 'admin'))
  if (existing.length === 0) {
    await db.insert(users).values({
      username: 'admin',
      nickname: '管理员',
      passwordHash,
      isAdmin: true,
    })
    console.log('Admin user created (username: admin, password: admin)')
  } else {
    console.log('Admin user already exists')
  }

  process.exit(0)
}

main()
