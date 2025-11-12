-- Compare two games: Meltys Quest (723090) vs Ancestors Legacy Free Peasant Edition (720380)
SELECT 
  'left' AS side,
  g.name,
  gd.release_date,
  g.price,
  d.genres,
  (
    SELECT GROUP_CONCAT(dev.name SEPARATOR ', ')
    FROM game_developer gdev
    JOIN developers dev ON gdev.developer_id = dev.developer_id
    WHERE gdev.app_id = g.app_id
  ) AS developers,
  g.score,
  (
    (SELECT price FROM games WHERE app_id = 723090)
    - (SELECT price FROM games WHERE app_id = 720380)
  ) AS price_delta,
  (
    (SELECT score FROM games WHERE app_id = 723090)
    - (SELECT score FROM games WHERE app_id = 720380)
  ) AS score_delta
FROM games g
LEFT JOIN game_details gd ON g.app_id = gd.app_id
LEFT JOIN descriptors d ON g.app_id = d.app_id
WHERE g.app_id = 723090

UNION ALL

SELECT 
  'right' AS side,
  g.name,
  gd.release_date,
  g.price,
  d.genres,
  (
    SELECT GROUP_CONCAT(dev.name SEPARATOR ', ')
    FROM game_developer gdev
    JOIN developers dev ON gdev.developer_id = dev.developer_id
    WHERE gdev.app_id = g.app_id
  ) AS developers,
  g.score,
  (
    (SELECT price FROM games WHERE app_id = 720380)
    - (SELECT price FROM games WHERE app_id = 723090)
  ) AS price_delta,
  (
    (SELECT score FROM games WHERE app_id = 720380)
    - (SELECT score FROM games WHERE app_id = 723090)
  ) AS score_delta
FROM games g
LEFT JOIN game_details gd ON g.app_id = gd.app_id
LEFT JOIN descriptors d ON g.app_id = d.app_id
WHERE g.app_id = 720380;
