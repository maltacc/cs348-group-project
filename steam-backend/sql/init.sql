-- Create database and user if they don't exist
CREATE DATABASE IF NOT EXISTS steam_demo;

CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'apppw';
GRANT ALL PRIVILEGES ON steam_demo.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

USE steam_demo;

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  genre VARCHAR(50)
);

-- Seed with sample data if not already present
INSERT INTO games (title, genre)
SELECT * FROM (SELECT 'Portal 2', 'Puzzle') t
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title='Portal 2');

INSERT INTO games (title, genre)
SELECT * FROM (SELECT 'Hades', 'Roguelike') t
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title='Hades');

INSERT INTO games (title, genre)
SELECT * FROM (SELECT 'Stardew Valley', 'Simulation') t
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title='Stardew Valley');

