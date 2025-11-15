SELECT 
    dev.name AS developer,
    AVG(g.score) AS avg_score,
    COUNT(*) AS game_count
FROM developers dev
JOIN game_developer gd  ON gd.developer_id = dev.developer_id
JOIN games g            ON g.app_id = gd.app_id
GROUP BY dev.developer_id, dev.name
HAVING COUNT(*) >= 2
ORDER BY avg_score DESC,
         game_count DESC,
         developer ASC
LIMIT 10;
