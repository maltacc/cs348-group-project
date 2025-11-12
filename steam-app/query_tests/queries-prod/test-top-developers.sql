SELECT d.name AS developers, AVG(g.score) AS avg_score
FROM developers d
JOIN game_developer gd ON d.developer_id = gd.developer_id
JOIN games g ON gd.app_id = g.app_id
WHERE g.score IS NOT NULL
GROUP BY d.developer_id, d.name
HAVING COUNT(*) >= 2
ORDER BY avg_score DESC, d.name ASC
LIMIT 10;
