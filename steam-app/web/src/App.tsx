import { useEffect, useState } from "react";

type Game = {
  id: number; app_id: number; name: string;
  release_date: string | null; price: number | null;
  genres: string | null; developers: string | null;
  publishers: string | null; score: number | null; platforms: string | null;
};

export default function App() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Game[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const c = new AbortController();
    fetch(`/api/games?limit=${limit}&offset=${offset}&q=${encodeURIComponent(q)}`, { signal: c.signal })
      .then(r => r.json()).then(setRows).catch(() => {});
    return () => c.abort();
  }, [q, offset]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h1>steam hello db</h1>
      <input
        placeholder="search"
        value={q}
        onChange={e => { setOffset(0); setQ(e.target.value); }}
        style={{ padding: 8, width: 280, marginRight: 8 }}
      />
      <button onClick={() => setOffset(Math.max(0, offset - limit))}>prev</button>
      <button onClick={() => setOffset(offset + limit)} style={{ marginLeft: 8 }}>next</button>
      <p style={{ opacity: .7 }}>rows: {rows.length} (offset {offset})</p>
      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr><th>app_id</th><th>name</th><th>release</th><th>price</th><th>genres</th><th>devs</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.app_id}</td><td>{r.name}</td><td>{r.release_date ?? ""}</td>
              <td>{r.price ?? ""}</td><td>{r.genres ?? ""}</td><td>{r.developers ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
