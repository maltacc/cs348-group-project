SELECT name, genres, price, score
FROM games
WHERE name like '%counter-strike 2%'
  AND price < 20.00;
