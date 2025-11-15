SELECT 
	g.app_id as id,
	g.name,
	g.price,
	g.description,
	g.score,
	gd.release_date as releaseDate,
	d.genres,
	d.tags,
	gs.user_score as userScore,
	gs.metacritic_score as criticScore,
	gs.player_sentiment as sentiment,
	GROUP_CONCAT(DISTINCT dev.name SEPARATOR ', ') as developer
FROM games g
LEFT JOIN game_details gd ON g.app_id = gd.app_id
LEFT JOIN descriptors d ON g.app_id = d.app_id
LEFT JOIN game_scores gs ON g.app_id = gs.app_id
LEFT JOIN game_developer gdev ON g.app_id = gdev.app_id
LEFT JOIN developers dev ON gdev.developer_id = dev.developer_id
WHERE g.app_id = 10
GROUP BY g.app_id
LIMIT 1;