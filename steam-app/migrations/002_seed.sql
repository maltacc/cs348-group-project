use steam;

insert into games (app_id, name, release_date, price, genres, developers, publishers, score, reviews, platforms)
values
  (1001, 'fake game 1', '2015-01-01', 9.99, 'Action;Indie', 'Studio A', 'PubCo', 72, null, 'windows;linux'),
  (1002, 'fake game 2', '2018-06-15', 19.99, 'Puzzle', 'Studio B', 'PubCo', 85, 'mostly positive', 'windows;mac'),
  (1003, 'fake game 3', '2020-09-20', 0.00, 'RPG', 'Indie Dev', 'Indie Pub', 90, 'overwhelmingly positive', 'windows'),
  (1004, 'fake game 4', '2021-03-10', 29.99, 'Strategy;Simulation', 'Big Studio', 'Big Pub', 68, null, 'windows;linux;mac'),
  (1005, 'fake game 5', '2019-12-25', 14.99, 'Horror', 'Spooky Games', 'ScaryPub', 77, 'mixed', 'windows');
