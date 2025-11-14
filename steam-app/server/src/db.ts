import mysql from 'mysql2/promise'
import { env } from './env'

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
})
