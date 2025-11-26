import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface DeveloperDuo {
  developer1: {
    id: string;
    name: string;
  };
  developer2: {
    id: string;
    name: string;
  };
  gamesCount: number;
  avgScore: number;
  totalRecommendations: number;
  games: string[];
}

export default function DeveloperDuosPage() {
  const [duos, setDuos] = useState<DeveloperDuo[]>([]);
  const [loading, setLoading] = useState(true);
  const [minGames, setMinGames] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({
      minGames: String(minGames),
      limit: "50",
    });

    fetch(`/api/games/analytics/developer-duos?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.avgScore - a.avgScore);
        setDuos(sorted);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching developer duos:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [minGames]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Developer Duo Analytics
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))" }}>
          Explore pairs of developers who frequently collaborate on games
        </p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>
            Adjust the minimum number of collaborative games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Label>
                Minimum Games Together: <strong>{minGames}</strong>
              </Label>
              <Slider
                value={[minGames]}
                onValueChange={(value) => setMinGames(value[0])}
                min={1}
                max={10}
                step={1}
                style={{ width: "100%", maxWidth: 448 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {duos.length === 0 && !loading ? (
        <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            No developer collaborations found with the current filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(1, 1fr)",
            position: "relative",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                borderRadius: 8,
              }}
            >
              <p style={{ color: "#fff", fontSize: 16 }}>Loading...</p>
            </div>
          )}
          {duos.map((duo, index) => (
            <Card
              key={`${duo.developer1.id}-${duo.developer2.id}`}
              style={{
                boxShadow: "var(--card-shadow)",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
            >
              <CardHeader>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <CardTitle style={{ fontSize: 18, marginBottom: 4 }}>
                      {duo.developer1.name}
                      <span
                        style={{
                          color: "hsl(var(--muted-foreground))",
                          marginLeft: 8,
                          marginRight: 8,
                        }}
                      >
                        ×
                      </span>
                      {duo.developer2.name}
                    </CardTitle>
                    <CardDescription>
                      Developer Collaboration #{index + 1}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div className="flex flex-wrap gap-4 bg-muted p-4 rounded-md items-center">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "hsl(var(--primary))",
                        }}
                      >
                        {duo.gamesCount}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        Games Together
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 24, fontWeight: 700 }}>
                        {duo.avgScore.toFixed(1)}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        Avg Score
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 24, fontWeight: 700 }}>
                        {duo.totalRecommendations.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        Total Recommendations
                      </span>
                    </div>
                  </div>

                  {duo.games.length > 0 && (
                    <div>
                      <h4
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        Top Collaborative Games:
                      </h4>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {duo.games.map((game, gameIndex) => (
                          <Badge
                            key={gameIndex}
                            variant="secondary"
                            style={{ fontSize: 12 }}
                          >
                            {game}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
