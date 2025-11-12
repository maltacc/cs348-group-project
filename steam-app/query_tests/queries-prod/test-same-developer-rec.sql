-- Recommend other games by the same developer
-- Example: Find other games by RewindApp (excluding app_id 914140 - Hentai Dojo)
SELECT g.name, g.score, g.price
FROM games g
JOIN game_developer gd ON g.app_id = gd.app_id
JOIN developers d ON gd.developer_id = d.developer_id
WHERE d.name = 'RewindApp'
  AND g.app_id != 914140
ORDER BY g.score DESC, g.name ASC
LIMIT 10;
