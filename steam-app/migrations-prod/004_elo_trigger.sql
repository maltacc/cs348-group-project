use steam_prod;

delimiter //

create trigger update_elo_on_comparison
after insert on game_comparison
for each row
begin
  declare loser_id bigint;
  declare expected_winner decimal(5,4);
  declare expected_loser decimal(5,4);
  declare k_winner decimal(5,2);
  declare k_loser decimal(5,2);
  declare elo_change_winner decimal(6,2);
  declare elo_change_loser decimal(6,2);
  
  if new.winner_app_id = new.app_id_1 then
    set loser_id = new.app_id_2;
  else
    set loser_id = new.app_id_1;
  end if;
  
  set expected_winner = 1 / (1 + power(10, (
    (select elo from game_elo where app_id = loser_id) - 
    (select elo from game_elo where app_id = new.winner_app_id)
  ) / 400));
  
  set expected_loser = 1 / (1 + power(10, (
    (select elo from game_elo where app_id = new.winner_app_id) - 
    (select elo from game_elo where app_id = loser_id)
  ) / 400));
  
  set k_winner = greatest(20, 40 - ((select games_played from game_elo where app_id = new.winner_app_id) * 0.5));
  set k_loser = greatest(20, 40 - ((select games_played from game_elo where app_id = loser_id) * 0.5));
  
  set elo_change_winner = k_winner * (1 - expected_winner);
  set elo_change_loser = k_loser * (0 - expected_loser);
  
  update game_elo
  set elo = elo + elo_change_winner,
      games_played = games_played + 1
  where app_id = new.winner_app_id;
  
  update game_elo
  set elo = elo + elo_change_loser,
      games_played = games_played + 1
  where app_id = loser_id;
end//

delimiter ;
