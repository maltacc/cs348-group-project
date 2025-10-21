SELECT name, genres, price
FROM games
WHERE name like '%fake game 3%'
  AND price < 20.00;