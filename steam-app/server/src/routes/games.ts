import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../db'

const router = Router()
const QuerySchema = z.object({
  q: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(100).optional()
  ),
  price: z.coerce.number().min(0).optional(),
  genres: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim()) {
      return val
        .split(',')
        .map((g) => g.trim())
        .filter((g) => g.length > 0)
    }
    return []
  }, z.array(z.string().trim().max(50)).default([])),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

router.get('/', async (req, res) => {
  const p = QuerySchema.safeParse(req.query)
  if (!p.success) return res.status(400).json({ error: p.error.flatten() })
  const { q, price, genres, limit, offset } = p.data

  const conditions = []
  const params: any = { limit, offset }

  if (q) {
    conditions.push('(name like :q)')
    params.q = `%${q}%`
  }
  if (price) {
    conditions.push('price <= :price')
    params.price = price
  }
  if (genres && genres.length > 0) {
    const genreConditions = genres.map(
      (_, index) => `genres like :genre${index}`
    )
    conditions.push(`(${genreConditions.join(' AND ')})`)
    genres.forEach((genre, index) => {
      params[`genre${index}`] = `%${genre}%`
    })
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [rows] = await pool.query(
    `
      select name, price, genres, score
      from games
      ${whereClause}
      order by id asc
      limit :limit offset :offset
    `,
    params
  )
  res.json(rows)
})

export default router
