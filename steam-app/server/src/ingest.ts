import { createPool } from 'mysql2/promise'
import { v5 as uuidv5 } from 'uuid'
import 'dotenv/config'

const pool = createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  multipleStatements: true,
})

const NS = '1b671a64-40d5-491e-99b0-da01ff1f3341' // Fixed UUID namespace for deterministic developer IDs

// API Configuration
const API_BASE_URL =
  'https://datasets-server.huggingface.co/rows?dataset=FronkonGames%2Fsteam-games-dataset&config=default&split=train'
const PAGE_SIZE = 100 // Number of rows per API request
const MAX_RETRIES = 10 // Maximum number of retries for failed requests
const BASE_DELAY = 3000 // Base delay in milliseconds (3 seconds - more conservative)
const REQUEST_DELAY = 2000 // Delay between successful requests (2 seconds)

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

// Helper: Sleep for a given number of milliseconds
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Helper: Fetch a page of data from the API with retry logic
async function fetchPage(
  offset: number,
  length: number,
  attempt = 1
): Promise<any> {
  const url = `${API_BASE_URL}&offset=${offset}&length=${length}`

  try {
    console.log(
      `Fetching: offset=${offset}, length=${length} (attempt ${attempt})`
    )

    const response = await fetch(url)

    if (response.status === 429) {
      // Rate limited - use exponential backoff
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Rate limit exceeded after ${MAX_RETRIES} attempts`)
      }

      const delay = BASE_DELAY * Math.pow(2, attempt - 1) // Exponential backoff
      console.log(`Rate limited! Waiting ${delay}ms before retry...`)
      await sleep(delay)
      return fetchPage(offset, length, attempt + 1)
    }

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      )
    }

    return await response.json()
  } catch (error: any) {
    if (attempt < MAX_RETRIES && error.message.includes('fetch')) {
      // Network error - retry with backoff
      const delay = BASE_DELAY * Math.pow(2, attempt - 1)
      console.log(`Network error! Waiting ${delay}ms before retry...`)
      await sleep(delay)
      return fetchPage(offset, length, attempt + 1)
    }
    throw error
  }
}

;(async () => {
  const conn = await pool.getConnection()

  let ok = 0,
    bad = 0,
    skipped = 0

  // Allow resuming from a specific offset (via environment variable or default to 0)
  let offset = Number(process.env.START_OFFSET ?? 0)
  let hasMore = true

  try {
    console.log('Starting ingestion from Hugging Face API...')
    if (offset > 0) {
      console.log(`Resuming from offset: ${offset}\n`)
    } else {
      console.log()
    }

    while (hasMore) {
      // Fetch next page
      const data = await fetchPage(offset, PAGE_SIZE)

      if (!data.rows || data.rows.length === 0) {
        console.log('No more data to process.')
        hasMore = false
        break
      }

      console.log(
        `Processing ${data.rows.length} rows from offset ${offset}...`
      )

      for (const item of data.rows) {
        const row = item.row

        // Filter: Only process if Score rank is not null
        if (row['Score rank'] === null || row['Score rank'] === undefined) {
          skipped++
          continue
        }

        try {
          // Validation
          const appId = Number(row.AppID)
          const name = String(row.Name ?? '').trim()
          const price = Number(row.Price ?? 0)
          const userScore = row['User score'] ? Number(row['User score']) : null
          if (
            !appId ||
            !name ||
            price < 0 ||
            (userScore !== null && (userScore < 0 || userScore > 100))
          ) {
            bad++
            continue
          }

          // Compute derived values
          const positive = Number(row.Positive ?? 0)
          const negative = Number(row.Negative ?? 0)
          const playerSentiment =
            positive + negative > 0 ? positive / (positive + negative) : null

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
              userScore,
              row['About the game'] ?? null,
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
            [
              appId,
              row.Genres ?? null,
              row.Categories ?? null,
              row.Tags ?? null,
            ]
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

      // Move to next page
      offset += PAGE_SIZE

      // If we got fewer rows than requested, we've reached the end
      if (data.rows.length < PAGE_SIZE) {
        console.log('Reached end of dataset.')
        hasMore = false
      }

      // Delay to avoid rate limiting
      if (hasMore) {
        await sleep(REQUEST_DELAY)
      }
    }

    console.log(
      `\nDone! Successfully inserted ${ok} games, rejected ${bad}, skipped ${skipped} (no score rank).`
    )
  } catch (error: any) {
    console.error(`\nError occurred at offset ${offset}:`, error.message)
    console.error(`\nTo resume from this point, run:`)
    console.error(`START_OFFSET=${offset} npm run ingest\n`)
    throw error
  } finally {
    conn.release()
    await pool.end()
  }
})()
