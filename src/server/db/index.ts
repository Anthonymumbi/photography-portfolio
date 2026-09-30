import { env } from '~/env.js'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { Pool } from '@neondatabase/serverless'
import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless'

// HTTP connection for regular queries
const sql = neon(env.DATABASE_URL)
export const db = drizzle(sql)

// WebSocket connection for transactions
const pool = new Pool({ connectionString: env.DATABASE_URL })
export const dbWithTx = drizzleWs(pool)