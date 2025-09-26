import express from "express";
import cors from "cors";
import { env } from "./env";
import games from "./routes/games";

const app = express();
app.use(cors());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/games", games);

app.listen(env.port, () => console.log(`api http://localhost:${env.port}`));