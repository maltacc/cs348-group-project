# Running the Database
From the repository root, run `docker compose up -d`

From this folder, run `docker exec -i mysql-steam-demo mysql -u root -prootpw < sql/init.sql`

Run `docker exec -it mysql-steam-demo mysql -u appuser -papppw -D steam_demo -e "SELECT * FROM games;"` to verify you created the table properly. It should output 

```
+----+----------------+------------+
| id | title          | genre      |
+----+----------------+------------+
|  1 | Portal 2       | Puzzle     |
|  2 | Hades          | Roguelike  |
|  3 | Stardew Valley | Simulation |
+----+----------------+------------+
```