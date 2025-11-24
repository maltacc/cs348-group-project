USE steam_prod;

-- Add FULLTEXT index for description-only similarity searches
ALTER TABLE games ADD FULLTEXT ft_games_desc (description);

-- Add composite index for developer overlap queries
CREATE INDEX idx_gd_dev_app ON game_developer (developer_id, app_id);

