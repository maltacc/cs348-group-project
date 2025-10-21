SELECT name, genres, price
FROM games
WHERE name like '%counter-strike 2%'
  AND price < 20.00;