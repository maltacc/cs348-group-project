import { Router } from 'express';
import { z } from 'zod';
import { pool, isProductionSchema } from '../db';

const router = Router();
const QuerySchema = z.object({
	q: z.preprocess(
		(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
		z.string().trim().max(100).optional()
	),
	price: z.coerce.number().min(0).optional(),
	genres: z.preprocess((val) => {
		if (typeof val === 'string' && val.trim()) {
			return val
				.split(',')
				.map((g) => g.trim())
				.filter((g) => g.length > 0);
		}
		return [];
	}, z.array(z.string().trim().max(50)).default([])),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

router.get('/', async (req, res) => {
	const p = QuerySchema.safeParse(req.query);
	if (!p.success) return res.status(400).json({ error: p.error.flatten() });
	const { q, price, genres, limit, offset } = p.data;

	const conditions = [];
	const params: any = { limit, offset };

	const isProd = isProductionSchema();

	if (q != null) {
		conditions.push('(g.name like :q)');
		params.q = `%${q}%`;
	}
	if (price != null) {
		conditions.push('g.price <= :price');
		params.price = price;
	}
	if (genres && genres.length > 0) {
		const genreConditions = genres.map(
			(_, index) => `d.genres like :genre${index}`
		);
		conditions.push(`(${genreConditions.join(' AND ')})`);
		genres.forEach((genre, index) => {
			params[`genre${index}`] = `%${genre}%`;
		});
	}

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	let query: string;

	if (isProd) {
		// Production schema: games + descriptors join
		query = `
      SELECT 
        g.app_id as id,
        g.name, 
        g.price, 
        d.genres as genres, 
        g.score
      FROM games g
      LEFT JOIN descriptors d ON g.app_id = d.app_id
      ${whereClause}
      ORDER BY g.app_id ASC
      LIMIT :limit OFFSET :offset
    `;
	} else {
		// Sample schema: games table only (alias table for consistency with WHERE clause)
		const sampleWhereClause = whereClause
			.replace(/g\./g, '')
			.replace(/d\./g, '');

		query = `
      SELECT 
        id,
        name, 
        price, 
        genres, 
        score
      FROM games
      ${sampleWhereClause}
      ORDER BY id ASC
      LIMIT :limit OFFSET :offset
    `;
	}

	const [rows] = await pool.query(query, params);

	// Handle NULL values in application code (replace NULL with empty string)
	const results = (rows as any[]).map((row) => ({
		...row,
		genres: row.genres ?? '',
	}));

	res.json(results);
});

export default router;
