SELECT developers, AVG(score) AS avg_score
FROM games
GROUP BY developers
HAVING COUNT(*) >= 2
ORDER BY avg_score DESC, developers ASC
LIMIT 10;
