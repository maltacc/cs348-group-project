SELECT name, score, price
FROM games
WHERE developers = 'Valve'
  AND app_id != 730
ORDER BY score DESC, name ASC
LIMIT 10;
