import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Star, Search, X } from 'lucide-react'
import type { GameDetail } from '@/types'

interface ComparisonData {
  side: 'left' | 'right'
  name: string
  releaseDate: string | null
  price: number | null
  genres: string[]
  developer: string
  score: number | null
  price_delta: number | null
  score_delta: number | null
}

export default function ComparePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const leftParam = searchParams.get('left')

  const [leftGameId, setLeftGameId] = useState<number | null>(leftParam ? Number(leftParam) : null)
  const [rightGameId, setRightGameId] = useState<number | null>(null)
  const [leftGame, setLeftGame] = useState<GameDetail | null>(null)
  const [rightGame, setRightGame] = useState<GameDetail | null>(null)
  const [comparison, setComparison] = useState<ComparisonData[]>([])
  const [loading, setLoading] = useState(false)
  const [leftSearchInput, setLeftSearchInput] = useState('')
  const [rightSearchInput, setRightSearchInput] = useState('')
  const [leftSearchResults, setLeftSearchResults] = useState<any[]>([])
  const [rightSearchResults, setRightSearchResults] = useState<any[]>([])
  const [leftSearching, setLeftSearching] = useState(false)
  const [rightSearching, setRightSearching] = useState(false)


  // Fetch left game details
  useEffect(() => {
    if (!leftGameId) {
      setLeftGame(null)
      return
    }
    const c = new AbortController()
    fetch(`/api/games/${leftGameId}`, { signal: c.signal })
      .then((r) => r.json())
      .then(setLeftGame)
      .catch(() => setLeftGame(null))
    return () => c.abort()
  }, [leftGameId])

  // Fetch right game details
  useEffect(() => {
    if (!rightGameId) {
      setRightGame(null)
      return
    }
    const c = new AbortController()
    fetch(`/api/games/${rightGameId}`, { signal: c.signal })
      .then((r) => r.json())
      .then(setRightGame)
      .catch(() => setRightGame(null))
    return () => c.abort()
  }, [rightGameId])

  // Fetch comparison data
  useEffect(() => {
    if (!leftGameId || !rightGameId) {
      setComparison([])
      return
    }
    const c = new AbortController()
    setLoading(true)
    fetch(`/api/games/${leftGameId}/compare?other=${rightGameId}`, { signal: c.signal })
      .then((r) => r.json())
      .then(setComparison)
      .catch(() => setComparison([]))
      .finally(() => setLoading(false))
    return () => c.abort()
  }, [leftGameId, rightGameId])

  // Handle search (generic)
  const handleSearch = async (query: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftSearchInput(query)
    } else {
      setRightSearchInput(query)
    }

    if (query.length < 2) {
      if (side === 'left') setLeftSearchResults([])
      else setRightSearchResults([])
      return
    }

    if (side === 'left') setLeftSearching(true)
    else setRightSearching(true)

    const c = new AbortController()
    try {
      const params = new URLSearchParams({ q: query, limit: '8' })
      const res = await fetch(`/api/games?${params.toString()}`, {
        signal: c.signal,
      })
      const data = await res.json()
      if (side === 'left') {
        setLeftSearchResults(Array.isArray(data) ? data : [])
      } else {
        setRightSearchResults(Array.isArray(data) ? data : [])
      }
    } catch {
      if (side === 'left') setLeftSearchResults([])
      else setRightSearchResults([])
    } finally {
      if (side === 'left') setLeftSearching(false)
      else setRightSearching(false)
    }
  }

  const selectGame = (gameId: number, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftGameId(gameId)
      setLeftSearchInput('')
      setLeftSearchResults([])
    } else {
      setRightGameId(gameId)
      setRightSearchInput('')
      setRightSearchResults([])
    }
  }

  const clearGame = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftGameId(null)
      setLeftSearchInput('')
      setLeftSearchResults([])
    } else {
      setRightGameId(null)
      setRightSearchInput('')
      setRightSearchResults([])
    }
  }

  // Helper function to get value color for comparison
  const getValueColor = (value: number | null, other: number | null, isLower: boolean = false) => {
    if (value === null || other === null) return '#9ca3af'
    if (value === other) return '#9ca3af'
    const isBetter = isLower ? value < other : value > other
    return isBetter ? '#10b981' : '#ef4444'
  }

  // Helper function to calculate percent difference
  const getPercentDifference = (value: number | null, other: number | null) => {
    if (value === null || other === null || other === 0) return null
    const diff = ((Math.abs(value - other)) / other) * 100
    return diff.toFixed(1)
  }

  // Helper function to determine if value is higher
  const isValueHigher = (value: number | null, other: number | null) => {
    if (value === null || other === null) return false
    return value > other
  }

  // Helper function to check if a genre is in another list
  const isGenreMatching = (genre: string, otherGenres: string[] | undefined) => {
    return otherGenres?.includes(genre) ?? false
  }

  const leftData = comparison.find((c) => c.side === 'left')
  const rightData = comparison.find((c) => c.side === 'right')


  return (
    <div
      style={{
        fontFamily: 'system-ui',
        background: '#121417',
        color: '#e9edf1',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#1a1f24',
          borderBottom: '1px solid #2a3138',
          padding: '32px 0',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
            Compare Games
          </h1>
          <p style={{ color: '#9ca3af' }}>
            Select two games to compare their attributes
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {/* Game Selection - Two Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            marginBottom: 32,
          }}
        >
          {/* Left Game Selection */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                padding: 24,
                background: '#1a1f24',
                border: '1px solid #2a3138',
                borderRadius: 8,
              }}
            >

              {!leftGame ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search for a game..."
                      value={leftSearchInput}
                      onChange={(e) => handleSearch(e.target.value, 'left')}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: '#20262c',
                        border: '1px solid #2a3138',
                        color: '#e9edf1',
                        borderRadius: 6,
                        outline: 'none',
                      }}
                    />
                    <Search
                      style={{
                        width: 20,
                        height: 20,
                        color: '#9ca3af',
                        position: 'absolute',
                        right: 12,
                        top: 10,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Left Search Results */}
                  {leftSearchResults.length > 0 && (
                    <div
                      style={{
                        background: '#20262c',
                        border: '1px solid #2a3138',
                        borderRadius: 6,
                        maxHeight: 300,
                        overflowY: 'auto',
                      }}
                    >
                      {leftSearchResults.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => selectGame(game.id, 'left')}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #2a3138',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2a3138'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 500 }}>{game.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>${game.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                        {leftGame.name}
                      </h3>
                      <p style={{ fontSize: 14, color: '#9ca3af' }}>{leftGame.developer}</p>
                    </div>
                    <button
                      onClick={() => clearGame('left')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      <X style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      paddingTop: 16,
                      borderTop: '1px solid #2a3138',
                    }}
                  >
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: 14 }}>Price</span>
                      <p style={{ fontWeight: 'bold', fontSize: 18 }}>${leftGame.price}</p>
                    </div>
                    <div>
                      <div style={{ color: '#9ca3af', fontSize: 14, display: 'flex', gap: 6 }}>
                        <Star style={{ width: 14, height: 14, color: '#f59e0b' }} />
                        Score
                      </div>
                      <p style={{ fontWeight: 'bold', fontSize: 18 }}>{leftGame.score}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Game Selection */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                padding: 24,
                background: '#1a1f24',
                border: '1px solid #2a3138',
                borderRadius: 8,
              }}
            >

              {!rightGame ? (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search for a game..."
                      value={rightSearchInput}
                      onChange={(e) => handleSearch(e.target.value, 'right')}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: '#20262c',
                        border: '1px solid #2a3138',
                        color: '#e9edf1',
                        borderRadius: 6,
                        outline: 'none',
                      }}
                    />
                    <Search
                      style={{
                        width: 20,
                        height: 20,
                        color: '#9ca3af',
                        position: 'absolute',
                        right: 12,
                        top: 10,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Right Search Results */}
                  {rightSearchResults.length > 0 && (
                    <div
                      style={{
                        background: '#20262c',
                        border: '1px solid #2a3138',
                        borderRadius: 6,
                        maxHeight: 300,
                        overflowY: 'auto',
                      }}
                    >
                      {rightSearchResults.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => selectGame(game.id, 'right')}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #2a3138',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2a3138'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 500 }}>{game.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>${game.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                        {rightGame.name}
                      </h3>
                      <p style={{ fontSize: 14, color: '#9ca3af' }}>{rightGame.developer}</p>
                    </div>
                    <button
                      onClick={() => clearGame('right')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      <X style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      paddingTop: 16,
                      borderTop: '1px solid #2a3138',
                    }}
                  >
                    <div>
                      <span style={{ color: '#9ca3af', fontSize: 14 }}>Price</span>
                      <p style={{ fontWeight: 'bold', fontSize: 18 }}>${rightGame.price}</p>
                    </div>
                    <div>
                      <div style={{ color: '#9ca3af', fontSize: 14, display: 'flex', gap: 6 }}>
                        <Star style={{ width: 14, height: 14, color: '#f59e0b' }} />
                        Score
                      </div>
                      <p style={{ fontWeight: 'bold', fontSize: 18 }}>{rightGame.score}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Table - Only show when both games selected */}
        {leftGame && rightGame && (
          <div
            style={{
              padding: 24,
              background: '#1a1f24',
              border: '1px solid #2a3138',
              borderRadius: 8,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
              Detailed Comparison
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                Loading comparison data...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 0,
                  border: '1px solid #2a3138',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: 16,
                    background: '#0f1217',
                    fontWeight: 600,
                    borderRight: '1px solid #2a3138',
                  }}
                >
                  Attribute
                </div>
                <div
                  style={{
                    padding: 16,
                    background: '#0f1217',
                    fontWeight: 600,
                    borderRight: '1px solid #2a3138',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#15181d')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0f1217')}
                  onClick={() => navigate(`/games/${leftGame.id}`)}
                  title={`View ${leftGame.name}`}
                >
                  {leftGame.name}
                </div>
                <div
                  style={{
                    padding: 16,
                    background: '#0f1217',
                    fontWeight: 600,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#15181d')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0f1217')}
                  onClick={() => navigate(`/games/${rightGame.id}`)}
                  title={`View ${rightGame.name}`}
                >
                  {rightGame.name}
                </div>

                {/* Price */}
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    color: '#9ca3af',
                  }}
                >
                  Price
                </div>
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    color: getValueColor(leftData?.price, rightData?.price, true),
                    fontWeight: 500,
                  }}
                >
                  <div>${leftData?.price}</div>
                  {getPercentDifference(leftData?.price, rightData?.price) && (
                    <div style={{ fontSize: 12, color: getValueColor(leftData?.price, rightData?.price, true), marginTop: 4 }}>
                      ({isValueHigher(rightData?.price, leftData?.price) ? '−' : '+'}
                      {getPercentDifference(leftData?.price, rightData?.price)}%)
                    </div>
                  )}
                </div>
                 <div
                  style={{
                    padding: 16,
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    color: getValueColor(rightData?.price, leftData?.price, true),
                    fontWeight: 500,
                  }}
                >
                  <div>${rightData?.price}</div>
                  {getPercentDifference(rightData?.price, leftData?.price) && (
                    <div style={{ fontSize: 12, color: getValueColor(rightData?.price, leftData?.price, true), marginTop: 4 }}>
                      ({isValueHigher(leftData?.price, rightData?.price) ? '−' : '+'}
                      {getPercentDifference(rightData?.price, leftData?.price)}%)
                    </div>
                  )}
                </div>

                {/* Score */}
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    color: '#9ca3af',
                  }}
                >
                  Score
                </div>
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: getValueColor(leftData?.score, rightData?.score, false),
                    fontWeight: 500,
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star style={{ width: 16, height: 16, color: '#f59e0b' }} />
                    <span>{leftData?.score}%</span>
                  </div>
                  {getPercentDifference(leftData?.score, rightData?.score) && (
                    <div style={{ fontSize: 12, color: getValueColor(leftData?.score, rightData?.score, false), marginTop: 4 }}>
                      ({isValueHigher(leftData?.score, rightData?.score) ? '+' : '−'}
                      {getPercentDifference(leftData?.score, rightData?.score)}%)
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: 16,
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: getValueColor(rightData?.score, leftData?.score, false),
                    fontWeight: 500,
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star style={{ width: 16, height: 16, color: '#f59e0b' }} />
                    <span>{rightData?.score}%</span>
                  </div>
                  {getPercentDifference(rightData?.score, leftData?.score) && (
                    <div style={{ fontSize: 12, color: getValueColor(rightData?.score, leftData?.score, false), marginTop: 4 }}>
                      ({isValueHigher(rightData?.score, leftData?.score) ? '+' : '−'}
                      {getPercentDifference(rightData?.score, leftData?.score)}%)
                    </div>
                  )}
                </div>

                {/* Release Date */}
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    color: '#9ca3af',
                  }}
                >
                  Release Date
                </div>
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                >
                  {leftData?.releaseDate
                    ? new Date(leftData.releaseDate).toLocaleDateString()
                    : 'N/A'}
                </div>
                <div
                  style={{
                    padding: 16,
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                >
                  {rightData?.releaseDate
                    ? new Date(rightData.releaseDate).toLocaleDateString()
                    : 'N/A'}
                </div>

                {/* Developer */}
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    color: '#9ca3af',
                  }}
                >
                  Developer
                </div>
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                >
                  {leftData?.developer}
                </div>
                <div
                  style={{
                    padding: 16,
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                >
                  {rightData?.developer}
                </div>

                {/* Genres */}
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    color: '#9ca3af',
                  }}
                >
                  Genres
                </div>
                <div
                  style={{
                    padding: 16,
                    borderRight: '1px solid #2a3138',
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  {leftData?.genres && leftData.genres.length > 0
                    ? leftData.genres.slice(0, 4).map((g) => {
                        const isMatching = isGenreMatching(g, rightData?.genres)
                        return (
                          <Badge
                            key={g}
                            variant="outline"
                            style={{
                              fontSize: 11,
                              borderColor: isMatching ? '#10b981' : '#ef4444',
                              backgroundColor: isMatching ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isMatching ? '#10b981' : '#ef4444',
                            }}
                          >
                            {g}
                          </Badge>
                        )
                      })
                    : 'N/A'}
                </div>
                <div
                  style={{
                    padding: 16,
                    borderTop: '1px solid #2a3138',
                    textAlign: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    justifyContent: 'center',
                  }}
                >
                  {rightData?.genres && rightData.genres.length > 0
                    ? rightData.genres.slice(0, 4).map((g) => {
                        const isMatching = isGenreMatching(g, leftData?.genres)
                        return (
                          <Badge
                            key={g}
                            variant="outline"
                            style={{
                              fontSize: 11,
                              borderColor: isMatching ? '#10b981' : '#ef4444',
                              backgroundColor: isMatching ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: isMatching ? '#10b981' : '#ef4444',
                            }}
                          >
                            {g}
                          </Badge>
                        )
                      })
                    : 'N/A'}
                </div>
              </div>
            )}

            {/* Bottom action buttons removed in favor of clickable table cells */}
          </div>
        )}
      </div>
    </div>
  )
}
