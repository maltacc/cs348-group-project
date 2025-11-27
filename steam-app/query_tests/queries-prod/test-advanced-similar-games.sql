USE steam_prod;

SET @source_app_id = 730;

SELECT 
  @source_description := g.description,
  @source_score := g.score,
  @source_price := g.price,
  @source_primary_genre := SUBSTRING_INDEX(d.genres, ',', 1)
FROM games g
LEFT JOIN descriptors d ON d.app_id = g.app_id
WHERE g.app_id = @source_app_id
LIMIT 1;

SELECT 
  g.app_id,
  g.name,
  g.price,
  g.score,
  d.genres,
  @source_primary_genre as primary_genre,
  GROUP_CONCAT(DISTINCT dev.name SEPARATOR ', ') as developers
FROM games g
LEFT JOIN descriptors d ON d.app_id = g.app_id
LEFT JOIN game_developer gd ON g.app_id = gd.app_id
LEFT JOIN developers dev ON gd.developer_id = dev.developer_id
WHERE g.app_id = @source_app_id
GROUP BY g.app_id, g.name, g.price, g.score, d.genres;

SELECT
  g2.app_id,
  g2.name,
  g2.price,
  g2.score,
  d2.genres,
  COUNT(DISTINCT CASE WHEN gd1.developer_id IS NOT NULL
                      THEN gd2.developer_id END) as shared_devs,
  CASE
    WHEN SUBSTRING_INDEX(d2.genres, ',', 1) = @source_primary_genre
    THEN 1 ELSE 0
  END as same_primary_genre,
  COALESCE(ABS(g2.score - @source_score), 999) as score_diff,
  COALESCE(ABS(g2.price - @source_price), 999) as price_diff,
  COALESCE(
    MATCH(g2.description) AGAINST (@source_description IN NATURAL LANGUAGE MODE),
    0
  ) as desc_similarity
FROM games g2
LEFT JOIN descriptors d2
  ON d2.app_id = g2.app_id
LEFT JOIN game_developer gd2
  ON gd2.app_id = g2.app_id
LEFT JOIN game_developer gd1
  ON gd1.developer_id = gd2.developer_id
 AND gd1.app_id = @source_app_id
WHERE g2.app_id <> @source_app_id
GROUP BY
  g2.app_id,
  g2.name,
  g2.price,
  g2.score,
  d2.genres,
  same_primary_genre,
  score_diff,
  price_diff,
  desc_similarity
ORDER BY
  shared_devs DESC,
  same_primary_genre DESC,
  desc_similarity DESC,
  score_diff ASC,
  price_diff ASC
LIMIT 10;
