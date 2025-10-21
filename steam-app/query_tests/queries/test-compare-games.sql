SELECT 
  'left' AS side,
  name,
  release_date,
  price,
  genres,
  developers,
  score,
  (
    (SELECT price FROM games WHERE app_id = 1245620)
    - (SELECT price FROM games WHERE app_id = 271590)
  ) AS price_delta,
  (
    (SELECT score FROM games WHERE app_id = 1245620)
    - (SELECT score FROM games WHERE app_id = 271590)
  ) AS score_delta
FROM games
WHERE app_id = 1245620

UNION ALL

SELECT 
  'right' AS side,
  name,
  release_date,
  price,
  genres,
  developers,
  score,
  (
    (SELECT price FROM games WHERE app_id = 271590)
    - (SELECT price FROM games WHERE app_id = 1245620)
  ) AS price_delta,
  (
    (SELECT score FROM games WHERE app_id = 271590)
    - (SELECT score FROM games WHERE app_id = 1245620)
  ) AS score_delta
FROM games
WHERE app_id = 271590;
