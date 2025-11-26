import { createPool } from 'mysql2/promise'
import { v5 as uuidv5 } from 'uuid'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'

const pool = createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  multipleStatements: true,
})

const NS = '1b671a64-40d5-491e-99b0-da01ff1f3341' // Fixed UUID namespace for deterministic developer IDs

// Helper: Canonicalize strings for deduplication
function canonicalize(s: string) {
  return s.normalize('NFC').trim().toLowerCase()
}

// Helper: Parse date string to MySQL DATE format (YYYY-MM-DD)
function parseDate(dateStr?: string | null): string | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0] as string | null
  } catch {
    return null
  }
}

;(async () => {
  const conn = await pool.getConnection()

  let ok = 0,
    bad = 0,
    skipped = 0

  try {
    // Read data from raw.json
    const rawPath = path.join(__dirname, '../raw.json')
    console.log(`Reading data from ${rawPath}...`)

    if (!fs.existsSync(rawPath)) {
      throw new Error(
        `raw.json not found at ${rawPath}. Please run 'npm run get-data' first.`
      )
    }

    const rawData = fs.readFileSync(rawPath, 'utf-8')
    const rows = JSON.parse(rawData)

    if (!Array.isArray(rows)) {
      throw new Error(
        'Invalid data format in raw.json. Expected an array of rows.'
      )
    }

    console.log(`Loaded ${rows.length} rows from raw.json\n`)
    console.log('Starting ingestion into database...\n')

    // Track games with their total ratings for later Elo initialization
    const gamesWithRatings: Array<{ appId: number; totalRatings: number }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      try {
        // Validation
        const appId = Number(row.AppID)
        const name = String(row.Name ?? '').trim()
        const price = Number(row.Price ?? 0)
        const userScore = row['User score'] ? Number(row['User score']) : null
        if (!appId || !name || price < 0) {
          bad++
          continue
        }

        // Compute derived values
        const positive = Number(row.Positive ?? 0)
        const negative = Number(row.Negative ?? 0)
        const totalRatings = positive + negative
        const playerSentiment =
          positive + negative > 0 ? positive / (positive + negative) : null

        // Calculate score from positive/negative ratings (0-100 scale)
        const calculatedScore =
          playerSentiment !== null ? Math.round(playerSentiment * 100) : null

        // Use calculated score as fallback if no user score exists
        const finalScore = userScore ?? calculatedScore

        // Skip only if we have no score at all
        if (finalScore === null) {
          skipped++
          continue
        }

        if (totalRatings > 0) {
          gamesWithRatings.push({ appId, totalRatings })
        }

        const releaseDate = parseDate(row['Release date'])

        // === INSERT GAME FIRST (must exist before linking to developers) ===
        // Insert/update games table
        await conn.query(
          `INSERT INTO games (app_id, name, price, header_image, score, description)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               name = VALUES(name),
               price = VALUES(price),
               header_image = VALUES(header_image),
               score = VALUES(score),
               description = VALUES(description)`,
          [
            appId,
            name,
            price,
            row['Header image'] ?? null,
            finalScore,
            row['About the game'] ?? '',
          ]
        )

        // Insert/update game_details table
        if (releaseDate) {
          await conn.query(
            `INSERT INTO game_details (app_id, release_date, dlc_count, about, website_url, screenshots, movies)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               release_date = VALUES(release_date),
               dlc_count = VALUES(dlc_count),
               about = VALUES(about),
               website_url = VALUES(website_url),
               screenshots = VALUES(screenshots),
               movies = VALUES(movies)`,
            [
              appId,
              releaseDate,
              row['DLC count'] ?? 0,
              row['About the game'] ?? null,
              row.Website ?? null,
              row.Screenshots ?? null,
              row.Movies ?? null,
            ]
          )
        }

        // Insert/update game_scores table
        await conn.query(
          `INSERT INTO game_scores (app_id, metacritic_score, user_score, player_sentiment, recommendations, notes)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             metacritic_score = VALUES(metacritic_score),
             user_score = VALUES(user_score),
             player_sentiment = VALUES(player_sentiment),
             recommendations = VALUES(recommendations),
             notes = VALUES(notes)`,
          [
            appId,
            row['Metacritic score'] || null,
            userScore,
            playerSentiment,
            row.Recommendations ?? null,
            row.Notes ?? null,
          ]
        )

        // Insert/update descriptors table
        await conn.query(
          `INSERT INTO descriptors (app_id, genres, categories, tags)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             genres = VALUES(genres),
             categories = VALUES(categories),
             tags = VALUES(tags)`,
          [appId, row.Genres ?? null, row.Categories ?? null, row.Tags ?? null]
        )

        // === INSERT DEVELOPERS (after game exists) ===
        const devNames = (row.Developers ?? '')
          .split(',')
          .map((d: string) => d.trim())
          .filter(Boolean)

        for (const dev of devNames) {
          const canonical = canonicalize(dev)
          const developerId = uuidv5(canonical, NS)

          // Insert developer into developers table (unique developers only)
          try {
            await conn.query(
              `INSERT INTO developers (developer_id, name) VALUES (?, ?)`,
              [developerId, dev]
            )
          } catch (e: any) {
            // Skip duplicate developers
            if (e.code !== 'ER_DUP_ENTRY') {
              console.warn(
                `Error inserting developer "${dev}" (${developerId}):`,
                e.message
              )
            }
          }

          // Link game to developer in game_developer table
          try {
            await conn.query(
              `INSERT INTO game_developer (app_id, developer_id) VALUES (?, ?)`,
              [appId, developerId]
            )
          } catch (e: any) {
            // Skip duplicate game-developer links
            if (e.code !== 'ER_DUP_ENTRY') {
              console.warn(
                `Error linking game ${appId} to developer "${dev}":`,
                e.message
              )
            }
          }
        }

        ok++
        if (ok % 100 === 0) {
          console.log(`Successfully processed ${ok} games so far...`)
        }
      } catch (e) {
        bad++
        console.warn(`Error processing row ${row?.AppID}:`, e)
      }
    }

    console.log(
      `\nDone! Successfully inserted ${ok} games, rejected ${bad}, skipped ${skipped} (no score data).`
    )

    console.log('\nPopulating game_elo table with top 100 most popular games...')
    
    // Sort games by total ratings and take top 100
    const top100Games = gamesWithRatings
      .sort((a, b) => b.totalRatings - a.totalRatings)
      .slice(0, 100)

    let eloInserted = 0
    for (const game of top100Games) {
      try {
        await conn.query(
          `INSERT INTO game_elo (app_id, elo, games_played)
           VALUES (?, 1500.00, 0)
           ON DUPLICATE KEY UPDATE
             elo = VALUES(elo),
             games_played = VALUES(games_played)`,
          [game.appId]
        )
        eloInserted++
      } catch (e: any) {
        console.warn(`Error inserting game_elo for app_id ${game.appId}:`, e.message)
      }
    }

    console.log(`Successfully initialized ${eloInserted} games in game_elo table`)
  } catch (error: any) {
    console.error(`\nError occurred:`, error.message)
    throw error
  } finally {
    conn.release()
    await pool.end()
  }
})()
