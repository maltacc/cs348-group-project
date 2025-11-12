create database if not exists steam_prod
  charset utf8mb4 collate utf8mb4_0900_ai_ci;
use steam_prod;

create table games (
  app_id         bigint primary key,
  name           varchar(255) not null,
  price          decimal(10,2) not null check (price >= 0),
  header_image   text null,
  score          int null check (score between 0 and 100),
  description    text null
);

create table game_details (
  app_id         bigint primary key,
  release_date   date not null,
  dlc_count      int default 0,
  about          text null,
  website_url    text null,
  screenshots    text null,
  movies         text null,
  constraint fk_details_game foreign key (app_id) references games(app_id) on delete cascade
);

create table developers (
  developer_id  varchar(36) primary key,
  name          varchar(255) not null unique
);

create table game_developer (
  app_id        bigint not null,
  developer_id  varchar(36) not null,
  primary key (app_id, developer_id),
  foreign key (app_id) references games(app_id) on delete cascade,
  foreign key (developer_id) references developers(developer_id) on delete cascade
);

create table game_scores (
  app_id            bigint primary key,
  metacritic_score  int null check (metacritic_score between 0 and 100),
  user_score        int null check (user_score between 0 and 100),
  player_sentiment  decimal(5,4) null,
  score_rank        int null,
  recommendations   int null,
  notes             text null,
  foreign key (app_id) references games(app_id) on delete cascade
);

create table descriptors (
    app_id            bigint primary key,
    genres            varchar(512) null,
    categories        varchar(512) null,
    tags              varchar(512) null,
    foreign key (app_id) references games(app_id) on delete cascade
);

create index idx_game_details_release on game_details(release_date);
create index idx_games_price on games(price);
