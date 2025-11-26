use steam_sample;

-- Insert games
insert into games (app_id, name, price, header_image, score, description)
values
  (570, 'Dota 2', 0.00, null, 83, 'A free-to-play multiplayer online battle arena video game.'),
  (730, 'Counter-Strike 2', 0.00, null, 82, 'The next evolution of Counter-Strike.'),
  (1172470, 'Apex Legends', 0.00, null, 78, 'A free-to-play battle royale hero shooter.'),
  (292030, 'The Witcher 3: Wild Hunt', 39.99, null, 94, 'An action role-playing game set in an open world environment.'),
  (1245620, 'ELDEN RING', 59.99, null, 90, 'An action role-playing game developed by FromSoftware.'),
  (271590, 'Grand Theft Auto V', 29.99, null, 79, 'An action-adventure game in an open world environment.'),
  (413150, 'Stardew Valley', 14.99, null, 93, 'An indie farming simulation role-playing game.'),
  (1091500, 'Cyberpunk 2077', 59.99, null, 71, 'An open-world action-adventure RPG set in Night City.'),
  (252490, 'Rust', 39.99, null, 69, 'A multiplayer survival game.'),
  (1966720, 'Lethal Company', 9.99, null, 88, 'A co-op horror game about scavenging at abandoned moons.');

-- Insert game details
insert into game_details (app_id, release_date, dlc_count, about, website_url, screenshots, movies)
values
  (570, '2013-07-09', 0, 'Dota 2 is a multiplayer online battle arena video game.', null, null, null),
  (730, '2023-09-27', 0, 'Counter-Strike 2 is the next evolution of CS.', null, null, null),
  (1172470, '2020-11-04', 5, 'Apex Legends is a free-to-play battle royale game.', null, null, null),
  (292030, '2015-05-19', 2, 'The Witcher 3 is a story-driven open world RPG.', null, null, null),
  (1245620, '2022-02-25', 1, 'ELDEN RING is an action RPG set in the Lands Between.', null, null, null),
  (271590, '2015-04-14', 0, 'GTA V is an action-adventure game set in Los Santos.', null, null, null),
  (413150, '2016-02-26', 0, 'Stardew Valley is a farming simulation game.', null, null, null),
  (1091500, '2020-12-10', 1, 'Cyberpunk 2077 is an open-world RPG set in Night City.', null, null, null),
  (252490, '2018-02-08', 0, 'Rust is a multiplayer survival game.', null, null, null),
  (1966720, '2023-10-23', 0, 'Lethal Company is a co-op horror survival game.', null, null, null);

-- Insert developers
insert into developers (developer_id, name)
values
  ('00000000-0000-0000-0000-000000000001', 'Valve'),
  ('00000000-0000-0000-0000-000000000002', 'Respawn Entertainment'),
  ('00000000-0000-0000-0000-000000000003', 'CD PROJEKT RED'),
  ('00000000-0000-0000-0000-000000000004', 'FromSoftware'),
  ('00000000-0000-0000-0000-000000000005', 'Rockstar North'),
  ('00000000-0000-0000-0000-000000000006', 'ConcernedApe'),
  ('00000000-0000-0000-0000-000000000007', 'Facepunch Studios'),
  ('00000000-0000-0000-0000-000000000008', 'Zeekerss');

-- Link games to developers
insert into game_developer (app_id, developer_id)
values
  (570, '00000000-0000-0000-0000-000000000001'),       -- Dota 2 -> Valve
  (730, '00000000-0000-0000-0000-000000000001'),       -- CS2 -> Valve
  (1172470, '00000000-0000-0000-0000-000000000002'),   -- Apex -> Respawn
  (292030, '00000000-0000-0000-0000-000000000003'),    -- Witcher 3 -> CDPR
  (1245620, '00000000-0000-0000-0000-000000000004'),   -- Elden Ring -> FromSoftware
  (271590, '00000000-0000-0000-0000-000000000005'),    -- GTA V -> Rockstar
  (413150, '00000000-0000-0000-0000-000000000006'),    -- Stardew -> ConcernedApe
  (1091500, '00000000-0000-0000-0000-000000000003'),   -- Cyberpunk -> CDPR
  (252490, '00000000-0000-0000-0000-000000000007'),    -- Rust -> Facepunch
  (1966720, '00000000-0000-0000-0000-000000000008');   -- Lethal Company -> Zeekerss

-- Insert game scores
insert into game_scores (app_id, user_score, recommendations, notes)
values
  (570, 83, 1500000, 'Very Positive'),
  (730, 82, 800000, 'Very Positive'),
  (1172470, 78, 600000, 'Mostly Positive'),
  (292030, 94, 2000000, 'Overwhelmingly Positive'),
  (1245620, 90, 900000, 'Very Positive'),
  (271590, 79, 1200000, 'Very Positive'),
  (413150, 93, 500000, 'Overwhelmingly Positive'),
  (1091500, 71, 400000, 'Mostly Positive'),
  (252490, 69, 300000, 'Mixed'),
  (1966720, 88, 250000, 'Overwhelmingly Positive');

-- Insert descriptors
insert into descriptors (app_id, genres, categories, tags)
values
  (570, 'MOBA,Strategy,Action', 'Multi-player,Online', 'MOBA,Strategy,Free to Play'),
  (730, 'FPS,Action,Tactical', 'Multi-player,Online', 'FPS,Tactical,Competitive'),
  (1172470, 'FPS,Battle Royale,Action', 'Multi-player,Free to Play', 'Battle Royale,FPS,Hero Shooter'),
  (292030, 'RPG,Open World,Adventure', 'Single-player', 'RPG,Open World,Story Rich'),
  (1245620, 'RPG,Action,Souls-like,Open World', 'Single-player', 'Souls-like,Dark Fantasy,Open World'),
  (271590, 'Action,Open World,Adventure', 'Single-player,Multi-player', 'Open World,Action,Crime'),
  (413150, 'Simulation,RPG,Indie,Farming', 'Single-player', 'Farming,Indie,Relaxing'),
  (1091500, 'RPG,Action,Open World,Sci-Fi', 'Single-player', 'Cyberpunk,Open World,RPG'),
  (252490, 'Survival,Multiplayer,Open World', 'Multi-player,Online', 'Survival,Crafting,PvP'),
  (1966720, 'Horror,Co-op,Indie,Survival', 'Co-op,Multi-player', 'Horror,Co-op,Survival');

-- Insert game elo ratings
insert into game_elo (app_id, elo, games_played)
values
  (292030, 1520.00, 15),
  (1245620, 1485.00, 12),
  (413150, 1505.00, 8),
  (730, 1495.00, 10);  
