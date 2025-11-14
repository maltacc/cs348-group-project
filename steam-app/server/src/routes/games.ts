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

  if (q != null) {
    conditions.push('(g.name like :q)')
    params.q = `%${q}%`
  }
  if (price != null) {
    conditions.push('g.price <= :price')
    params.price = price
  }
  if (genres && genres.length > 0) {
    const genreConditions = genres.map(
      (_, index) => `d.genres like :genre${index}`
    )
    conditions.push(`(${genreConditions.join(' AND ')})`)
    genres.forEach((genre, index) => {
      params[`genre${index}`] = `%${genre}%`
    })
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const query = `
		SELECT 
			g.app_id as id,
			g.name, 
			g.price, 
			d.genres as genres, 
			g.score
		FROM games g
		LEFT JOIN descriptors d ON g.app_id = d.app_id
		${whereClause}
		ORDER BY g.app_id ASC
		LIMIT :limit OFFSET :offset
	`

  const [rows] = await pool.query(query, params)

  // Handle NULL values in application code (replace NULL with empty string)
  const results = (rows as any[]).map((row) => ({
    ...row,
    genres: row.genres ?? '',
  }))

  res.json(results)
})

router.get('/:id', async (req, res) => {
  const gameId = req.params.id

  const query = `
		SELECT 
			g.app_id as id,
			g.name,
			g.price,
			g.description,
			g.score,
			gd.release_date as releaseDate,
			d.genres,
			d.tags,
			gs.user_score as userScore,
			gs.metacritic_score as criticScore,
			gs.player_sentiment as sentiment,
			GROUP_CONCAT(DISTINCT dev.name SEPARATOR ', ') as developer
		FROM games g
		LEFT JOIN game_details gd ON g.app_id = gd.app_id
		LEFT JOIN descriptors d ON g.app_id = d.app_id
		LEFT JOIN game_scores gs ON g.app_id = gs.app_id
		LEFT JOIN game_developer gdev ON g.app_id = gdev.app_id
		LEFT JOIN developers dev ON gdev.developer_id = dev.developer_id
		WHERE g.app_id = :gameId
		GROUP BY g.app_id
		LIMIT 1
	`

  const [rows] = await pool.query(query, { gameId })
  const game = (rows as any[])[0]
  if (!game) {
    return res.status(404).json({ error: 'Game not found' })
  }

  const result = {
    id: game.id,
    name: game.name,
    price: game.price,
    description: game.description || '',
    releaseDate: game.releaseDate,
    developer: game.developer || 'Unknown',
    publisher: game.developer || 'Unknown',
    score: game.score,
    userScore: game.userScore,
    criticScore: game.criticScore,
    sentiment:
      game.sentiment > 0.7
        ? 'positive'
        : game.sentiment > 0.4
        ? 'mixed'
        : 'negative',
    genres: game.genres
      ? game.genres.split(',').map((g: string) => g.trim())
      : [],
    tags: game.tags
      ? game.tags
          .split(',')
          .map((t: string) => t.trim())
          .slice(0, 10)
      : [],
  }

  res.json(result)
})

// Get recommended games by genre
router.get('/:id/recommendations/genre', async (req, res) => {
  const gameId = req.params.id
  try {
    const [genre_rows] = await pool.query(
      'SELECT genres FROM descriptors WHERE app_id = :gameId LIMIT 1',
      { gameId }
    )
    const genresStr = (genre_rows as any[])[0]?.genres || ''
    const genres: string[] = genresStr
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

    if (genres.length === 0) {
      return res.json([])
    }

    const params: any = { gameId }
    const conditions = genres.map((g: string, i: number) => {
      params[`genre${i}`] = `%${g}%`
      return `d.genres LIKE :genre${i}`
    })

    const query = `
      SELECT DISTINCT
        g.app_id as id,
        g.name,
        g.score,
        g.price,
        d.genres
      FROM games g
      JOIN descriptors d ON g.app_id = d.app_id
      WHERE g.app_id != :gameId
        AND (${conditions.join(' OR ')})
      ORDER BY g.score DESC, g.name ASC
      LIMIT 10
    `

    const [rows] = await pool.query(query, params)
    const results = (rows as any[]).map((row) => ({
      ...row,
      genres: row.genres ?? '',
    }))
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genre recommendations' })
  }
})

// Get recommended games by developer
router.get('/:id/recommendations/developer', async (req, res) => {
  const gameId = req.params.id

  const query = `
    SELECT DISTINCT
      g.name,
      g.score,
      g.price
    FROM games g
    JOIN game_developer gd ON gd.app_id = g.app_id
    WHERE g.app_id != :gameId
      AND gd.developer_id IN (
        SELECT gd2.developer_id FROM game_developer gd2 WHERE gd2.app_id = :gameId
      )
    ORDER BY g.score DESC
    LIMIT 10
  `

  try {
    const [rows] = await pool.query(query, { gameId })
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch developer recommendations' })
  }
})

export default router
