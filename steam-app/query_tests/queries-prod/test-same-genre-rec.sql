-- Recommend games with similar genres
-- Example: Find games similar to BADASS (588920) which has Adventure,RPG,Strategy genres
-- TODO: Change to app_id 730 and genres FPS,Action,Tactical once data is loaded
SELECT g.name, g.score, d.genres
FROM games g
JOIN descriptors d ON g.app_id = d.app_id
WHERE g.app_id != 588920
  AND (
    d.genres LIKE '%Adventure%' OR
    d.genres LIKE '%RPG%' OR
    d.genres LIKE '%Strategy%'
  )
ORDER BY g.score DESC, g.name ASC
LIMIT 10;
