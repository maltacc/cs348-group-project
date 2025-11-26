SELECT * 
FROM game_elo
WHERE app_id IN (10, 220)
ORDER BY app_id;

INSERT INTO game_comparison (app_id_1, app_id_2, winner_app_id)
VALUES (10, 220, 10);

SELECT *
FROM game_elo
WHERE app_id IN (10, 220)
ORDER BY app_id;
