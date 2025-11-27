USE steam_prod;
SELECT 
  g.app_id as id,
  g.name, 
  g.price, 
  d.genres as genres, 
  g.score,
  MATCH(g.name, g.description) AGAINST ('open world' IN NATURAL LANGUAGE MODE) as relevance
FROM games g
LEFT JOIN descriptors d ON g.app_id = d.app_id
WHERE MATCH(g.name, g.description) AGAINST ('open world' IN NATURAL LANGUAGE MODE) > 0
ORDER BY relevance DESC
LIMIT 10;
