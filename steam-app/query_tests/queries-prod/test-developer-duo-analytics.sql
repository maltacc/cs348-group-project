-- finds pairs of developers who frequently collaborate
-- Uses STRAIGHT_JOIN and FORCE INDEX for performance optimization
-- computes the number of games together, average review score, total recommendations

use steam_prod;
SELECT STRAIGHT_JOIN
    d1.developer_id as developer1_id,
    dev1.name as developer1_name,
    d2.developer_id as developer2_id,
    dev2.name as developer2_name,
    COUNT(DISTINCT d1.app_id) as games_together,
    ROUND(AVG(g.score), 2) as avg_score,
    SUM(COALESCE(gs.recommendations, 0)) as total_recommendations,
    GROUP_CONCAT(DISTINCT g.name ORDER BY g.score DESC SEPARATOR '; ') as game_titles
FROM game_developer d1 FORCE INDEX (idx_game_developer_composite)
INNER JOIN game_developer d2 FORCE INDEX (idx_game_developer_composite)
    ON d1.app_id = d2.app_id 
    AND d1.developer_id < d2.developer_id  -- Ensures each pair appears only once
INNER JOIN developers dev1 
    ON d1.developer_id = dev1.developer_id
INNER JOIN developers dev2 
    ON d2.developer_id = dev2.developer_id
INNER JOIN games g 
    ON d1.app_id = g.app_id
LEFT JOIN game_scores gs 
    ON g.app_id = gs.app_id
GROUP BY 
    d1.developer_id, 
    dev1.name, 
    d2.developer_id, 
    dev2.name
HAVING games_together >= 1  -- Can be adjusted to filter for frequent collaborators
ORDER BY games_together DESC, avg_score DESC
LIMIT 50;
