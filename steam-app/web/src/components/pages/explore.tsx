import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Star } from 'lucide-react'

interface TopDeveloper {
  developerId: string
  developer: string
  avgScore: number
  gameCount: number
}

interface TopGenre {
  genre: string
  avgScore: number
  gameCount: number
}

interface BestValueGame {
  id: number
  name: string
  price: number
  score: number
  valueScore: number
}

interface FreeGame {
  id: number
  name: string
  price: number
  score: number
}

interface ExploreResponse {
  topDevelopers: TopDeveloper[]
  topGenres: TopGenre[]
  bestValuePaid: BestValueGame[]
  topFreeGames: FreeGame[]
}

interface DeveloperGame {
  id: number
  name: string
  score: number
  price: number
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const [data, setData] = useState<ExploreResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDevelopers, setExpandedDevelopers] = useState<Set<string>>(new Set())
  const [developerGames, setDeveloperGames] = useState<Record<string, DeveloperGame[]>>({})
  const [loadingGames, setLoadingGames] = useState<Set<string>>(new Set())

  useEffect(() => {
    const c = new AbortController()
    setLoading(true)
    fetch('/api/games/explore', { signal: c.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load explore data')
        return r.json()
      })
      .then((json) => setData(json))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load')
      })
      .finally(() => setLoading(false))
    return () => c.abort()
  }, [])

  const toggleDeveloper = async (developerId: string) => {
    const isExpanded = expandedDevelopers.has(developerId)
    
    if (isExpanded) {
      const newExpanded = new Set(expandedDevelopers)
      newExpanded.delete(developerId)
      setExpandedDevelopers(newExpanded)
    } else {
      const newExpanded = new Set(expandedDevelopers)
      newExpanded.add(developerId)
      setExpandedDevelopers(newExpanded)
      
      // Fetch games if not already loaded
      if (!developerGames[developerId]) {
        const newLoading = new Set(loadingGames)
        newLoading.add(developerId)
        setLoadingGames(newLoading)
        
        try {
          const response = await fetch(`/api/games/developer/${developerId}`)
          if (!response.ok) throw new Error('Failed to load games')
          const games = await response.json()
          
          setDeveloperGames(prev => ({
            ...prev,
            [developerId]: games
          }))
        } catch (e) {
          console.error('Failed to load developer games', e)
          setDeveloperGames(prev => ({
            ...prev,
            [developerId]: []
          }))
        } finally {
          setLoadingGames(prev => {
            const updated = new Set(prev)
            updated.delete(developerId)
            return updated
          })
        }
      }
    }
  }

  const handleGenreClick = (genre: string) => {
    // Navigate to browse page with genre filter
    navigate(`/browse?genres=${encodeURIComponent(genre)}`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Explore</h1>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <section key={i} className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <div className="h-5 w-40 rounded" style={{ background: '#2a3138' }} />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((__, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-4 w-48 rounded" style={{ background: '#2a3138' }} />
                    <div className="h-4 w-24 rounded" style={{ background: '#2a3138' }} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {error && (
        <p className="text-red-400">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Developers */}
          <section className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h2 className="text-lg font-semibold tracking-tight text-primary">Top Developers by Score</h2>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-48 rounded" style={{ background: '#2a3138' }} />
                      <div className="h-4 w-24 rounded" style={{ background: '#2a3138' }} />
                    </div>
                  ))}
                </div>
              ) : !data || data.topDevelopers.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Loading data…</span>
                </div>
              ) : (
                data.topDevelopers.map((d, idx) => (
                  <div key={d.developerId} className="border-b pb-2 last:border-b-0">
                    <button
                      onClick={() => toggleDeveloper(d.developerId)}
                      className="w-full flex items-center justify-between hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">{idx + 1}.</span>
                        <span className="truncate">{d.developer}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {d.avgScore.toFixed(1)}
                        <span className="text-muted-foreground">({d.gameCount} games)</span>
                        </span>
                        {expandedDevelopers.has(d.developerId) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    
                    {expandedDevelopers.has(d.developerId) && (
                      <div className="mt-2 ml-6 space-y-1">
                        {loadingGames.has(d.developerId) ? (
                          <p className="text-sm text-muted-foreground">Loading games...</p>
                        ) : developerGames[d.developerId]?.length > 0 ? (
                          developerGames[d.developerId].map((game) => {
                            const price = Number(game.price) || 0
                            return (
                              <Link
                                key={game.id}
                                to={`/games/${game.id}`}
                                className="flex items-center justify-between text-sm text-primary py-1 hover:underline"
                              >
                                <span className="truncate pr-2">{game.name}</span>
                                <span className="flex items-center gap-3 text-muted-foreground whitespace-nowrap">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {game.score}
                                  </span>
                                  <span className="whitespace-nowrap">{price === 0 ? 'Free' : `$${price.toFixed(2)}`}</span>
                                </span>
                              </Link>
                            )
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No games found</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Top Genres */}
          <section className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h2 className="text-lg font-semibold tracking-tight text-primary">Top Genres by Score</h2>
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-40 rounded" style={{ background: '#2a3138' }} />
                      <div className="h-4 w-20 rounded" style={{ background: '#2a3138' }} />
                    </div>
                  ))}
                </div>
              ) : !data || data.topGenres.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Loading data…</span>
                </div>
              ) : (
                data.topGenres.map((g, idx) => (
                  <button
                    key={g.genre}
                    onClick={() => handleGenreClick(g.genre)}
                    className="w-full flex items-center justify-between hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">{idx + 1}.</span>
                      <span className="truncate">{g.genre}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {g.avgScore.toFixed(1)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Best Value Paid */}
          <section className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h2 className="text-lg font-semibold tracking-tight text-primary">Best-Value Paid Games</h2>
            </div>
            <ol className="space-y-3 list-decimal list-inside">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-48 rounded" style={{ background: '#2a3138' }} />
                      <div className="h-4 w-24 rounded" style={{ background: '#2a3138' }} />
                    </div>
                  ))}
                </div>
              ) : !data || data.bestValuePaid.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Loading data…</span>
                </div>
              ) : (
                data.bestValuePaid.map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-1.5">
                    <Link to={`/games/${g.id}`} className="truncate pr-3 hover:underline">{g.name}</Link>
                    <span className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {g.score}
                      </span>
                      ${g.price.toFixed(2)}
                    </span>
                  </li>
                ))
              )}
            </ol>
          </section>

          {/* Top Free Games */}
          <section className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h2 className="text-lg font-semibold tracking-tight text-primary">Top Free Games</h2>
            </div>
            <ol className="space-y-3 list-decimal list-inside">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-48 rounded" style={{ background: '#2a3138' }} />
                      <div className="h-4 w-24 rounded" style={{ background: '#2a3138' }} />
                    </div>
                  ))}
                </div>
              ) : !data || data.topFreeGames.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block h-3 w-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Loading data…</span>
                </div>
              ) : (
                data.topFreeGames.map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-1.5">
                    <Link to={`/games/${g.id}`} className="truncate pr-3 hover:underline">{g.name}</Link>
                    <span className="flex items-center gap-4 text-sm text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {g.score}
                      </span>
                      Free
                    </span>
                  </li>
                ))
              )}
            </ol>
          </section>
        </div>
    </div>
  )
}
