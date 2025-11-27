WITH genre_stats AS (
SELECT
	g.app_id,
	g.name,
	g.price,
	g.score,
	SUBSTRING_INDEX(d.genres, ',', 1) as primary_genre,
	AVG(g.price) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_avg_price,
	STDDEV_POP(g.price) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_stddev_price,
	AVG(g.score) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_avg_score,
	STDDEV_POP(g.score) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_stddev_score,
	COUNT(*) OVER (PARTITION BY SUBSTRING_INDEX(d.genres, ',', 1)) as genre_game_count
FROM games g
LEFT JOIN descriptors d ON g.app_id = d.app_id
WHERE g.price > 0
	AND g.score IS NOT NULL
	AND d.genres IS NOT NULL
)
SELECT
	app_id,
	name,
	price,
	score,
	primary_genre,
	genre_avg_price,
	genre_avg_score,
	genre_stddev_price as genre_price_stddev,
	genre_stddev_score as genre_score_stddev,
	genre_game_count,
	(price - genre_avg_price) / NULLIF(genre_stddev_price, 0) as price_z_score,
	(score - genre_avg_score) / NULLIF(genre_stddev_score, 0) as score_z_score,
	(score / NULLIF(price, 0)) / NULLIF((genre_avg_score / NULLIF(genre_avg_price, 0)), 0) as value_ratio
FROM genre_stats
WHERE app_id = 10
	AND genre_game_count >= 5;