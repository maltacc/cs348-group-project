import fs from 'fs'
import path from 'path'

// API Configuration
const API_BASE_URL =
  'https://datasets-server.huggingface.co/rows?dataset=FronkonGames%2Fsteam-games-dataset&config=default&split=train'
const PAGE_SIZE = 100 // Number of rows per API request
const MAX_RETRIES = 10 // Maximum number of retries for failed requests
const BASE_DELAY = 3000 // Base delay in milliseconds (3 seconds)
const REQUEST_DELAY = 2000 // Delay between successful requests (2 seconds)

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

// Validate that a row has the expected structure
function isValidRow(row: any): boolean {
  if (!row || typeof row !== 'object') return false

  // Check for required fields
  if (!row.AppID || !row.Name) return false

  // Basic type validation
  if (typeof row.AppID !== 'number' && typeof row.AppID !== 'string')
    return false
  if (typeof row.Name !== 'string') return false

  return true
}

;(async () => {
  let offset = Number(process.env.START_OFFSET ?? 0)
  let hasMore = true
  const allRows: any[] = []
  let validCount = 0
  let invalidCount = 0

  try {
    console.log('Starting data fetch from Hugging Face API...')
    if (offset > 0) {
      console.log(`Starting from offset: ${offset}\n`)
    } else {
      console.log()
    }

    while (hasMore) {
      // Fetch next page
      const data = await fetchPage(offset, PAGE_SIZE)

      if (!data.rows || data.rows.length === 0) {
        console.log('No more data to fetch.')
        hasMore = false
        break
      }

      console.log(`Fetched ${data.rows.length} rows from offset ${offset}...`)

      // Validate and collect rows
      for (const item of data.rows) {
        const row = item.row

        if (isValidRow(row)) {
          allRows.push(row)
          validCount++
        } else {
          invalidCount++
          console.warn(
            `Invalid row at offset ${offset}: missing required fields`
          )
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

    // Write to raw.json
    const outputPath = path.join(__dirname, '../raw.json')
    console.log(`\nWriting ${allRows.length} rows to ${outputPath}...`)

    fs.writeFileSync(outputPath, JSON.stringify(allRows, null, 2), 'utf-8')

    console.log(
      `\nDone! Fetched ${validCount} valid rows, rejected ${invalidCount} invalid rows.`
    )
    console.log(`Data saved to: ${outputPath}`)
  } catch (error: any) {
    console.error(`\nError occurred at offset ${offset}:`, error.message)
    console.error(`\nTo resume from this point, run:`)
    console.error(`START_OFFSET=${offset} npm run get-data\n`)
    throw error
  }
})()
