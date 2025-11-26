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
  fulltext: z
    .preprocess((v) => v === 'true' || v === true, z.boolean())
    .default(false),
})

router.get('/', async (req, res) => {
  const p = QuerySchema.safeParse(req.query)
  if (!p.success) return res.status(400).json({ error: p.error.flatten() })
  const { q, price, genres, limit, offset, fulltext } = p.data

  const params: any = { limit, offset }

  // Full-text search mode
  if (fulltext && q != null) {
    params.q = q

    const query = `
      SELECT 
        g.app_id as id,
        g.name, 
        g.price, 
        d.genres as genres, 
        g.score,
        MATCH(g.name, g.description) AGAINST (:q IN NATURAL LANGUAGE MODE) as relevance
      FROM games g
      LEFT JOIN descriptors d ON g.app_id = d.app_id
      WHERE MATCH(g.name, g.description) AGAINST (:q IN NATURAL LANGUAGE MODE) > 0
      ORDER BY relevance DESC
      LIMIT :limit OFFSET :offset
    `

    const [rows] = await pool.query(query, params)
    const results = (rows as any[]).map((row) => ({
      ...row,
      genres: row.genres ?? '',
    }))

    return res.json(results)
  }

  // Regular search mode (LIKE)
  const conditions = []

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
	  g.app_id as id,
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

// Get advanced similar games (multi-factor similarity)
router.get('/:id/recommendations/similar', async (req, res) => {
  const gameId = req.params.id

  try {
    // Step 1: Fetch source game data
    const sourceQuery = `
      SELECT 
        g.description,
        g.score,
        g.price,
        SUBSTRING_INDEX(d.genres, ',', 1) as primary_genre
      FROM games g
      LEFT JOIN descriptors d ON d.app_id = g.app_id
      WHERE g.app_id = :gameId
      LIMIT 1
    `

    const [sourceRows] = await pool.query(sourceQuery, { gameId })
    const sourceGame = (sourceRows as any[])[0]

    if (!sourceGame) {
      return res.status(404).json({ error: 'Source game not found' })
    }

    const {
      description: sourceDescription,
      score: sourceScore,
      price: sourcePrice,
      primary_genre: sourcePrimaryGenre,
    } = sourceGame

    // Step 2: Find similar games using multi-factor scoring
    const similarityQuery = `
      SELECT
        g2.app_id as id,
        g2.name,
        g2.price,
        g2.score,
        d2.genres,
        COUNT(DISTINCT CASE WHEN gd1.developer_id IS NOT NULL
                            THEN gd2.developer_id END) as shared_devs,
        CASE
          WHEN SUBSTRING_INDEX(d2.genres, ',', 1) = :sourcePrimaryGenre
          THEN 1 ELSE 0
        END as same_primary_genre,
        COALESCE(ABS(g2.score - :sourceScore), 999) as score_diff,
        COALESCE(ABS(g2.price - :sourcePrice), 999) as price_diff,
        COALESCE(
          MATCH(g2.description) AGAINST (:sourceDescription IN NATURAL LANGUAGE MODE),
          0
        ) as desc_similarity
      FROM games g2
      LEFT JOIN descriptors d2
        ON d2.app_id = g2.app_id
      LEFT JOIN game_developer gd2
        ON gd2.app_id = g2.app_id
      LEFT JOIN game_developer gd1
        ON gd1.developer_id = gd2.developer_id
       AND gd1.app_id = :gameId
      WHERE g2.app_id <> :gameId
      GROUP BY
        g2.app_id,
        g2.name,
        g2.price,
        g2.score,
        d2.genres,
        same_primary_genre,
        score_diff,
        price_diff,
        desc_similarity
      ORDER BY
        shared_devs DESC,
        same_primary_genre DESC,
        desc_similarity DESC,
        score_diff ASC,
        price_diff ASC
      LIMIT 10
    `

    const params = {
      gameId,
      sourceDescription: sourceDescription || '',
      sourceScore: sourceScore || 0,
      sourcePrice: sourcePrice || 0,
      sourcePrimaryGenre: sourcePrimaryGenre || '',
    }

    const [rows] = await pool.query(similarityQuery, params)
    const results = (rows as any[]).map((row) => ({
      ...row,
      genres: row.genres ?? '',
    }))

    res.json(results)
  } catch (error) {
    console.error('Error fetching similar games:', error)
    res.status(500).json({ error: 'Failed to fetch similar games' })
  }
})

// Get developer duo analytics - pairs of developers who frequently collaborate
router.get('/analytics/developer-duos', async (req, res) => {
  const MinGamesSchema = z.object({
    minGames: z.coerce.number().int().min(1).max(50).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })

  const p = MinGamesSchema.safeParse(req.query)
  if (!p.success) return res.status(400).json({ error: p.error.flatten() })
  const { minGames, limit } = p.data

  try {
    const query = `
      SELECT STRAIGHT_JOIN
        d1.developer_id as developer1_id,
        dev1.name as developer1_name,
        d2.developer_id as developer2_id,
        dev2.name as developer2_name,
        COUNT(DISTINCT d1.app_id) as games_together,
        ROUND(AVG(g.score), 2) as avg_score,
        SUM(COALESCE(gs.recommendations, 0)) as total_recommendations,
        GROUP_CONCAT(DISTINCT g.name ORDER BY g.score DESC SEPARATOR '; ') as game_titles
      FROM game_developer d1 FORCE INDEX (idx_game_developer_composite)
      INNER JOIN game_developer d2 FORCE INDEX (idx_game_developer_composite)
        ON d1.app_id = d2.app_id 
        AND d1.developer_id < d2.developer_id
      INNER JOIN developers dev1 
        ON d1.developer_id = dev1.developer_id
      INNER JOIN developers dev2 
        ON d2.developer_id = dev2.developer_id
      INNER JOIN games g 
        ON d1.app_id = g.app_id
      LEFT JOIN game_scores gs 
        ON g.app_id = gs.app_id
      GROUP BY 
        d1.developer_id, 
        dev1.name, 
        d2.developer_id, 
        dev2.name
      HAVING games_together >= :minGames
      ORDER BY games_together DESC, avg_score DESC
      LIMIT :limit
    `

    const [rows] = await pool.query(query, { minGames, limit })
    const results = (rows as any[]).map((row) => ({
      developer1: {
        id: row.developer1_id,
        name: row.developer1_name,
      },
      developer2: {
        id: row.developer2_id,
        name: row.developer2_name,
      },
      gamesCount: row.games_together,
      avgScore: Number(row.avg_score) || 0,
      totalRecommendations: Number(row.total_recommendations) || 0,
      games: row.game_titles
        ? row.game_titles.split('; ').slice(0, 5)
        : [],
    }))

    res.json(results)
  } catch (error) {
    console.error('Error fetching developer duo analytics:', error)
    res.status(500).json({ error: 'Failed to fetch developer duo analytics' })
  }
})

// Get price-value analysis for a specific game
router.get('/:id/price-value', async (req, res) => {
  const GameIdSchema = z.object({
    id: z.coerce.number().int().positive(),
  })

  const p = GameIdSchema.safeParse(req.params)
  if (!p.success) return res.status(400).json({ error: p.error.flatten() })

  const gameId = p.data.id

  try {
    const query = `
      WITH genre_stats AS (
        SELECT
          g.app_id,
          g.name,
          g.price,
          g.score,
          SUBSTRING_INDEX(d.genres, ',', 1) as primary_genre,
          AVG(g.price) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_avg_price,
          STDDEV_POP(g.price) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_stddev_price,
          AVG(g.score) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_avg_score,
          STDDEV_POP(g.score) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_stddev_score,
          COUNT(*) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_game_count
        FROM games g
        LEFT JOIN descriptors d ON g.app_id = d.app_id
        WHERE g.price > 0
          AND g.score IS NOT NULL
          AND d.genres IS NOT NULL
      )
      SELECT
        app_id,
        name,
        price,
        score,
        primary_genre,
        ROUND(genre_avg_price, 2) as genre_avg_price,
        ROUND(genre_avg_score, 2) as genre_avg_score,
        ROUND(genre_stddev_price, 2) as genre_price_stddev,
        ROUND(genre_stddev_score, 2) as genre_score_stddev,
        genre_game_count,
        ROUND((price - genre_avg_price) / NULLIF(genre_stddev_price, 0), 2) as price_z_score,
        ROUND((score - genre_avg_score) / NULLIF(genre_stddev_score, 0), 2) as score_z_score,
        ROUND((score / NULLIF(price, 0)) / NULLIF((genre_avg_score / NULLIF(genre_avg_price, 0)), 0), 2) as value_ratio,
        CASE
          WHEN (price - genre_avg_price) / NULLIF(genre_stddev_price, 0) > 1
               AND (score - genre_avg_score) / NULLIF(genre_stddev_score, 0) < -0.5
          THEN 'Overpriced'
          WHEN (price - genre_avg_price) / NULLIF(genre_stddev_price, 0) < -0.5
               AND (score - genre_avg_score) / NULLIF(genre_stddev_score, 0) > 0.5
          THEN 'Underpriced'
          WHEN (score / NULLIF(price, 0)) / NULLIF((genre_avg_score / NULLIF(genre_avg_price, 0)), 0) > 1.5
          THEN 'Great Value'
          WHEN (score / NULLIF(price, 0)) / NULLIF((genre_avg_score / NULLIF(genre_avg_price, 0)), 0) < 0.7
          THEN 'Poor Value'
          ELSE 'Fair Value'
        END as value_classification
      FROM genre_stats
      WHERE app_id = :gameId
        AND genre_game_count >= 5
    `

    const [rows] = await pool.query(query, { gameId })
    const results = rows as any[]

    if (results.length === 0) {
      return res.status(404).json({ error: 'Price-value analysis not available for this game' })
    }

    const row = results[0]
    const result = {
      id: row.app_id,
      name: row.name,
      price: Number(row.price),
      score: row.score,
      genre: row.primary_genre,
      genreAvgPrice: Number(row.genre_avg_price),
      genreAvgScore: Number(row.genre_avg_score),
      genrePriceStddev: Number(row.genre_price_stddev),
      genreScoreStddev: Number(row.genre_score_stddev),
      priceZScore: Number(row.price_z_score),
      scoreZScore: Number(row.score_z_score),
      valueRatio: Number(row.value_ratio),
      classification: row.value_classification,
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching price-value analysis:', error)
    res.status(500).json({ error: 'Failed to fetch price-value analysis' })
  }
})

export default router
