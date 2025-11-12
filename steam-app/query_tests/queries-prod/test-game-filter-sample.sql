SELECT g.name, d.genres, g.price, g.score
FROM games g
LEFT JOIN descriptors d ON g.app_id = d.app_id
WHERE g.name LIKE '%quest%'
  AND g.price < 20.00;
