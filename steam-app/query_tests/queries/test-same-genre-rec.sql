SELECT name, score
FROM games
WHERE app_id != 730
  AND (
    genres LIKE '%FPS%' OR
    genres LIKE '%Action%' OR
    genres LIKE '%Tactical%'
  )
ORDER BY score DESC, name ASC
LIMIT 10;
