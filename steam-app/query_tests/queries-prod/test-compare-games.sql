SELECT 
  'left' AS side,
  g.name,
  gd.release_date,
  g.price,
  d.genres,
  dev.name AS developer,
  g.score,
  (
    (SELECT price FROM games WHERE app_id = 1245620)
    - (SELECT price FROM games WHERE app_id = 739630)
  ) AS price_delta,
  (
    (SELECT score FROM games WHERE app_id = 1245620)
    - (SELECT score FROM games WHERE app_id = 739630)
  ) AS score_delta
FROM games g
JOIN game_details   gd  ON gd.app_id  = g.app_id
LEFT JOIN descriptors  d   ON d.app_id   = g.app_id
LEFT JOIN game_developer gdv ON gdv.app_id = g.app_id
LEFT JOIN developers   dev ON dev.developer_id = gdv.developer_id
WHERE g.app_id = 1245620

UNION ALL

SELECT 
  'right' AS side,
  g.name,
  gd.release_date,
  g.price,
  d.genres,
  dev.name AS developer,
  g.score,
  (
    (SELECT price FROM games WHERE app_id = 739630)
    - (SELECT price FROM games WHERE app_id = 1245620)
  ) AS price_delta,
  (
    (SELECT score FROM games WHERE app_id = 739630)
    - (SELECT score FROM games WHERE app_id = 1245620)
  ) AS score_delta
FROM games g
JOIN game_details   gd  ON gd.app_id  = g.app_id
LEFT JOIN descriptors  d   ON d.app_id   = g.app_id
LEFT JOIN game_developer gdv ON gdv.app_id = g.app_id
LEFT JOIN developers   dev ON dev.developer_id = gdv.developer_id
WHERE g.app_id = 739630;
