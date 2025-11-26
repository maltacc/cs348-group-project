import { useEffect, useState } from 'react'
import { Trophy, Swords, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Game {
  id: number
  name: string
  price: number
  score: number
  genres: string[]
  elo: number
  gamesPlayed: number
}

interface LeaderboardGame extends Game {
  rank: number
}

interface ComparisonResult {
  game1: {
    id: number
    eloBefore: number
    eloAfter: number
    eloChange: number
    gamesPlayedBefore: number
    gamesPlayedAfter: number
  }
  game2: {
    id: number
    eloBefore: number
    eloAfter: number
    eloChange: number
    gamesPlayedBefore: number
    gamesPlayedAfter: number
  }
  winnerId: number
}

export default function RankingsPage() {
  const [view, setView] = useState<'rank' | 'leaderboard'>('rank')
  const [gamePair, setGamePair] = useState<[Game, Game] | null>(null)
  const [loading, setLoading] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardGame[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Fetch random pair when entering rank view
  useEffect(() => {
    if (view === 'rank' && !gamePair && !showResult) {
      fetchRandomPair()
    }
  }, [view, gamePair, showResult])

  // Fetch leaderboard when entering leaderboard view
  useEffect(() => {
    if (view === 'leaderboard') {
      fetchLeaderboard()
    }
  }, [view])

  const fetchRandomPair = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/games/rankings/random-pair')
      if (!res.ok) throw new Error('Failed to fetch game pair')
      const data = await res.json()
      setGamePair(data)
    } catch (error) {
      console.error('Error fetching random pair:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true)
    try {
      const res = await fetch('/api/games/rankings/leaderboard')
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      const data = await res.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  const handleChoice = async (winnerId: number) => {
    if (!gamePair) return

    console.log('handleChoice called with winnerId:', winnerId)
    console.log('gamePair:', gamePair)
    
    const payload = {
      game1Id: gamePair[0].id,
      game2Id: gamePair[1].id,
      winnerId,
    }
    console.log('Sending payload:', payload)
    
    setLoading(true)
    try {
      const res = await fetch('/api/games/rankings/compare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('API error:', errorText)
        throw new Error('Failed to submit comparison')
      }
      const result = await res.json()
      console.log('Comparison result:', result)
      setComparisonResult(result)
      setShowResult(true)
    } catch (error) {
      console.error('Error submitting comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setShowResult(false)
    setComparisonResult(null)
    setGamePair(null)
    fetchRandomPair()
  }

  const getEloChangeDisplay = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    const color = change >= 0 ? '#10b981' : '#ef4444'
    return (
      <span style={{ color, fontWeight: 'bold' }}>
        {sign}
        {change.toFixed(1)}
      </span>
    )
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Trophy style={{ width: 32, height: 32, color: '#f59e0b' }} />
            <h1 style={{ fontSize: 32, fontWeight: 'bold' }}>Game Rankings</h1>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: 24 }}>
            Help rank the best games by choosing which one you'd rather play
          </p>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              onClick={() => setView('rank')}
              style={{
                background: view === 'rank' ? '#f59e0b' : '#20262c',
                border: '1px solid #2a3138',
                color: '#e9edf1',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Swords style={{ width: 16, height: 16 }} />
              Rank Games
            </Button>
            <Button
              onClick={() => setView('leaderboard')}
              style={{
                background: view === 'leaderboard' ? '#f59e0b' : '#20262c',
                border: '1px solid #2a3138',
                color: '#e9edf1',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Trophy style={{ width: 16, height: 16 }} />
              Leaderboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        {view === 'rank' ? (
          <div>
            {loading && !gamePair && !comparisonResult && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
                Loading games...
              </div>
            )}

            {!showResult && gamePair && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>
                  Which game would you rather play?
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: 24,
                    alignItems: 'center',
                    marginBottom: 24,
                  }}
                >
                  {/* Game 1 */}
                  <button
                    onClick={() => handleChoice(gamePair[0].id)}
                    disabled={loading}
                    style={{
                      background: '#1a1f24',
                      border: '2px solid #2a3138',
                      borderRadius: 12,
                      padding: 32,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: loading ? 0.6 : 1,
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#f59e0b'
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#2a3138'
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <h3 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                      {gamePair[0].name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Price: </span>
                        <span style={{ fontWeight: 600 }}>
                          {gamePair[0].price === 0 ? 'Free' : `$${gamePair[0].price.toFixed(2)}`}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Score: </span>
                        <span style={{ fontWeight: 600 }}>{gamePair[0].score}%</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Elo: </span>
                        <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                          {gamePair[0].elo.toFixed(0)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Genres: </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {gamePair[0].genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              style={{
                                background: '#20262c',
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                              }}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* VS divider */}
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: '#f59e0b',
                      padding: '0 16px',
                    }}
                  >
                    VS
                  </div>

                  {/* Game 2 */}
                  <button
                    onClick={() => handleChoice(gamePair[1].id)}
                    disabled={loading}
                    style={{
                      background: '#1a1f24',
                      border: '2px solid #2a3138',
                      borderRadius: 12,
                      padding: 32,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: loading ? 0.6 : 1,
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#f59e0b'
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#2a3138'
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <h3 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                      {gamePair[1].name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Price: </span>
                        <span style={{ fontWeight: 600 }}>
                          {gamePair[1].price === 0 ? 'Free' : `$${gamePair[1].price.toFixed(2)}`}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Score: </span>
                        <span style={{ fontWeight: 600 }}>{gamePair[1].score}%</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Elo: </span>
                        <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                          {gamePair[1].elo.toFixed(0)}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af', fontSize: 14 }}>Genres: </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {gamePair[1].genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              style={{
                                background: '#20262c',
                                padding: '4px 8px',
                                borderRadius: 4,
                                fontSize: 12,
                              }}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Skip Button */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2a3138',
                      color: '#9ca3af',
                      padding: '10px 24px',
                      borderRadius: 8,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#f59e0b'
                        e.currentTarget.style.color = '#f59e0b'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#2a3138'
                        e.currentTarget.style.color = '#9ca3af'
                      }
                    }}
                  >
                    Skip This Comparison
                  </button>
                </div>
              </div>
            )}

            {showResult && comparisonResult && gamePair && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>
                  Elo Updated!
                </h2>

                <div
                  style={{
                    background: '#1a1f24',
                    border: '1px solid #2a3138',
                    borderRadius: 12,
                    padding: 32,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    {/* Game 1 Result */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 'bold' }}>
                          {gamePair[0].name}
                        </h3>
                        {comparisonResult.winnerId === gamePair[0].id && (
                          <Trophy style={{ width: 20, height: 20, color: '#f59e0b' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Previous Elo: </span>
                          <span style={{ fontWeight: 600 }}>
                            {comparisonResult.game1.eloBefore.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>New Elo: </span>
                          <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                            {comparisonResult.game1.eloAfter.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Change: </span>
                          {getEloChangeDisplay(comparisonResult.game1.eloChange)}
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Games Played: </span>
                          <span style={{ fontWeight: 600 }}>
                            {comparisonResult.game1.gamesPlayedAfter}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Game 2 Result */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 'bold' }}>
                          {gamePair[1].name}
                        </h3>
                        {comparisonResult.winnerId === gamePair[1].id && (
                          <Trophy style={{ width: 20, height: 20, color: '#f59e0b' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Previous Elo: </span>
                          <span style={{ fontWeight: 600 }}>
                            {comparisonResult.game2.eloBefore.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>New Elo: </span>
                          <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                            {comparisonResult.game2.eloAfter.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Change: </span>
                          {getEloChangeDisplay(comparisonResult.game2.eloChange)}
                        </div>
                        <div>
                          <span style={{ color: '#9ca3af', fontSize: 14 }}>Games Played: </span>
                          <span style={{ fontWeight: 600 }}>
                            {comparisonResult.game2.gamesPlayedAfter}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleNext}
                    style={{
                      background: '#f59e0b',
                      border: 'none',
                      color: '#e9edf1',
                      padding: '12px 32px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    Next Comparison
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
              Top 100 Games by Elo
            </h2>

            {leaderboardLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
                Loading leaderboard...
              </div>
            ) : (
              <div
                style={{
                  background: '#1a1f24',
                  border: '1px solid #2a3138',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr style={{ background: '#0f1217', borderBottom: '1px solid #2a3138' }}>
                      <th style={{ padding: 16, textAlign: 'left', width: '8%' }}>Rank</th>
                      <th style={{ padding: 16, textAlign: 'left' }}>Game</th>
                      <th style={{ padding: 16, textAlign: 'left', width: '12%' }}>Elo</th>
                      <th style={{ padding: 16, textAlign: 'left', width: '12%' }}>Comparisons</th>
                      <th style={{ padding: 16, textAlign: 'left', width: '12%' }}>Score</th>
                      <th style={{ padding: 16, textAlign: 'left', width: '12%' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((game, index) => (
                      <tr
                        key={game.id}
                        style={{
                          borderBottom: '1px solid #2a3138',
                          background: index % 2 === 0 ? 'transparent' : '#171c21',
                        }}
                      >
                        <td style={{ padding: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {game.rank === 1 && (
                              <Trophy style={{ width: 20, height: 20, color: '#fbbf24' }} />
                            )}
                            {game.rank === 2 && (
                              <Trophy style={{ width: 20, height: 20, color: '#9ca3af' }} />
                            )}
                            {game.rank === 3 && (
                              <Trophy style={{ width: 20, height: 20, color: '#cd7f32' }} />
                            )}
                            <span style={{ fontWeight: 600 }}>#{game.rank}</span>
                          </div>
                        </td>
                        <td style={{ padding: 16 }}>
                          <a
                            href={`/games/${game.id}`}
                            style={{
                              color: '#e9edf1',
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#f59e0b'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#e9edf1'
                            }}
                          >
                            {game.name}
                          </a>
                        </td>
                        <td style={{ padding: 16 }}>
                          <span style={{ fontWeight: 600, color: '#f59e0b' }}>
                            {game.elo.toFixed(0)}
                          </span>
                        </td>
                        <td style={{ padding: 16, color: '#9ca3af' }}>{game.gamesPlayed}</td>
                        <td style={{ padding: 16 }}>{game.score}%</td>
                        <td style={{ padding: 16 }}>
                          {game.price === 0 ? 'Free' : `$${game.price.toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
