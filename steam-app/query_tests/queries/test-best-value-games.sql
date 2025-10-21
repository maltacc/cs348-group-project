SELECT name, price, score, (score / LOG(price + 2)) AS value_score
FROM games
WHERE price > 0.00
ORDER BY value_score DESC, score DESC, price ASC
LIMIT 10;
