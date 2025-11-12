import mysql from 'mysql2/promise'
import { env } from './env'

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
})

// Helper to determine if we're using the production schema
export const isProductionSchema = () => {
  return env.db.database === 'steam_prod'
}
