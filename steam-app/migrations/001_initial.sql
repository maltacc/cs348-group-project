-- create database if not exists
create database if not exists steam charset utf8mb4 collate utf8mb4_0900_ai_ci;
use steam;

-- create games table
create table if not exists games (
  id bigint unsigned not null auto_increment primary key,
  app_id int unsigned not null,
  name varchar(255) not null,
  release_date date null,
  price decimal(10,2) null,
  genres varchar(512) null,
  developers varchar(512) null,
  publishers varchar(512) null,
  score int null,
  reviews text null,
  platforms varchar(64) null,
  key app_id_idx (app_id),
  key name_idx (name),
  key genres_idx (genres)
);
