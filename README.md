# cs348-group-project
## Setup
Navigate into `steam-app/server` and `steam-app/web`. Run `npm i` for both folders. Then, run `npm run dev` on both folders. You should be able to open the webpage and see a basic UI. 

For the database, ensure you have `mysql` installed (`brew mysql@8.4`).

Run `brew services start mysql` and then run `mysql -uroot < migrations/initial.sql`. To verify you have set up the database correctly, run `mysql -uroot -p` and hit enter again (empty password). Run `use steam; show tables; describe games;` and you should get the following output:

```
Database changed
+-----------------+
| Tables_in_steam |
+-----------------+
| games           |
+-----------------+
1 row in set (0.002 sec)

+--------------+-----------------+------+-----+---------+----------------+
| Field        | Type            | Null | Key | Default | Extra          |
+--------------+-----------------+------+-----+---------+----------------+
| id           | bigint unsigned | NO   | PRI | NULL    | auto_increment |
| app_id       | int unsigned    | NO   | MUL | NULL    |                |
| name         | varchar(255)    | NO   | MUL | NULL    |                |
| release_date | date            | YES  |     | NULL    |                |
| price        | decimal(10,2)   | YES  |     | NULL    |                |
| genres       | varchar(512)    | YES  | MUL | NULL    |                |
| developers   | varchar(512)    | YES  |     | NULL    |                |
| publishers   | varchar(512)    | YES  |     | NULL    |                |
| score        | int             | YES  |     | NULL    |                |
| reviews      | text            | YES  |     | NULL    |                |
| platforms    | varchar(64)     | YES  |     | NULL    |                |
+--------------+-----------------+------+-----+---------+----------------+
```
