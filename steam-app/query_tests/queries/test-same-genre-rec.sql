SELECT DISTINCT
  g.app_id as id,
  g.name,
  g.score,
  g.price,
  d.genres
FROM games g
JOIN descriptors d ON g.app_id = d.app_id
WHERE g.app_id != 730
  AND 
    d.genres LIKE '%Adventure%' OR
    d.genres LIKE '%RPG%' OR
    d.genres LIKE '%Strategy%'
ORDER BY g.score DESC, g.name ASC;
