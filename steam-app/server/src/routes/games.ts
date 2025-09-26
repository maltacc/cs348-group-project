import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";

const router = Router();
const QuerySchema = z.object({
    q: z.preprocess(
      v => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().trim().max(100).optional()
    ),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  });
  

router.get("/", async (req, res) => {
  const p = QuerySchema.safeParse(req.query);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  const { q, limit, offset } = p.data;

  const [rows] = await pool.query(
    `
      select id, app_id, name, release_date, price, genres, developers, publishers, score, platforms
      from games
      ${q ? "where name like :q or genres like :q or developers like :q" : ""}
      order by id asc
      limit :limit offset :offset
    `,
    { q: q ? `%${q}%` : undefined, limit, offset }
  );
  res.json(rows);
});

export default router;
