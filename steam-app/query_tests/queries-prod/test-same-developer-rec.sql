SELECT DISTINCT
  g.name,
  g.score,
  g.price
FROM games g
JOIN game_developer gd ON gd.app_id = g.app_id
WHERE g.app_id != 730
  AND gd.developer_id IN (
    SELECT gd2.developer_id FROM game_developer gd2 WHERE gd2.app_id = 730
  )
ORDER BY g.score DESC
LIMIT 10; 