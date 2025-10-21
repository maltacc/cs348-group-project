import { useEffect, useState } from 'react'

type Game = {
  id: number
  app_id: number
  name: string
  release_date: string | null
  price: number | null
  genres: string | null
  developers: string | null
  publishers: string | null
  score: number | null
  platforms: string | null
}

const genresList = [
  'All Genres',
  'MOBA',
  'Strategy',
  'Action',
  'FPS',
  'Tactical',
  'Battle Royale',
  'Adventure',
  'Open World',
  'Souls-like',
  'Simulation',
  'RPG',
  'Farming',
  'Indie',
  'Sci-Fi',
  'Multiplayer',
  'Survival',
  'Horror',
  'Co-op',
]
export default function App() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Game[]>([])
  const [offset, setOffset] = useState(0)
  const [price, setPrice] = useState(100)
  const [genres, setGenres] = useState<string[]>([])
  const limit = 20

  useEffect(() => {
    const c = new AbortController()
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      q: q,
      price: String(price),
    })

    params.append('genres', genres.join(','))
    console.log('params', params.toString())

    fetch(`/api/games?${params.toString()}`, { signal: c.signal })
      .then((r) => r.json())
      .then(setRows)
      .catch(() => {})
    return () => c.abort()
  }, [q, offset, price, genres])

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>steam hello db</h1>
      <input
        placeholder="search"
        value={q}
        onChange={(e) => {
          setOffset(0)
          setQ(e.target.value)
        }}
        style={{ padding: 8, width: 280, marginRight: 8 }}
      />
      <div style={{ display: 'inline-block', marginRight: 8 }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: 2 }}>
          Max Price: ${price}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={price}
          onChange={(e) => {
            setOffset(0)
            setPrice(Number(e.target.value))
          }}
          style={{ width: 200 }}
        />
      </div>
      <div style={{ display: 'inline-block', marginRight: 8 }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: 2 }}>
          Genres: {genres.length > 0 ? genres.join(', ') : 'All'}
        </label>
        <select
          multiple
          value={genres}
          onChange={(e) => {
            setOffset(0)
            const selectedOptions = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            )
            setGenres(selectedOptions)
          }}
          style={{
            padding: 4,
            width: 200,
            height: 120,
            fontSize: '14px',
          }}
        >
          {genresList.map((g) => (
            <>
              {g === 'All Genres' ? (
                <option key={g} value="">
                  {g}
                </option>
              ) : (
                <option key={g} value={g}>
                  {g}
                </option>
              )}
            </>
          ))}
        </select>
      </div>
      <button onClick={() => setOffset(Math.max(0, offset - limit))}>
        prev
      </button>
      <button
        onClick={() => setOffset(offset + limit)}
        style={{ marginLeft: 8 }}
      >
        next
      </button>
      <p style={{ opacity: 0.7 }}>
        rows: {rows.length} (offset {offset})
      </p>
      <table
        border={1}
        cellPadding={6}
        style={{ borderCollapse: 'collapse', width: '100%' }}
      >
        <thead>
          <tr>
            <th>app_id</th>
            <th>name</th>
            <th>release</th>
            <th>price</th>
            <th>genres</th>
            <th>devs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.app_id}</td>
              <td>{r.name}</td>
              <td>{r.release_date ?? ''}</td>
              <td>{r.price ?? ''}</td>
              <td>{r.genres ?? ''}</td>
              <td>{r.developers ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
