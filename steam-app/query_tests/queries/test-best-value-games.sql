SELECT 
    g.name,
    g.price,
    g.score,
    (g.score / LOG(g.price + 2)) AS value_score
FROM games g
JOIN game_details gd ON gd.app_id = g.app_id
WHERE g.price > 0.00
ORDER BY value_score DESC,
         g.score DESC,
         g.price ASC
LIMIT 10;
