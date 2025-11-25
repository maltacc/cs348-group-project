use steam_prod;

-- add composite index for efficient developer duo lookups
-- this index optimizes the self-join used in developer collaboration queries
CREATE INDEX idx_game_developer_composite ON game_developer(app_id, developer_id);
