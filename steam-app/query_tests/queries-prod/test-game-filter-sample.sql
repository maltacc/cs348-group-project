SELECT 
  g.app_id as id,
  g.name, 
  g.price, 
  d.genres as genres, 
  g.score
FROM games g
LEFT JOIN descriptors d ON g.app_id = d.app_id
WHERE name LIKE '%quest%'
  AND price < 20.00
LIMIT 10;