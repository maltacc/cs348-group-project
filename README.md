# cs348-group-project

## Setup

### Application Setup

Navigate into `steam-app/server` and `steam-app/web`. Run `npm i` for both folders.

### Database Setup

#### MySQL Installation

For the database, ensure you have `mysql` installed.

**For Mac:**

```bash
brew mysql@8.4
```

**For Windows:**

1. **Option A: Official MySQL Installer**

   - Download MySQL Community Server from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Run the installer and follow the setup wizard
   - During installation:
     - Choose "Developer Default" setup type
     - Set root password to empty
       - if you already set a root password:
         - pass in -p flag with any mysql commands
         - in the future .env step, set 'DB_PASSWORD=<your_password>'
     - Configure MySQL as a Windows service
   - Add MySQL to your PATH:
     - Open System Properties → Environment Variables
     - Add MySQL (e.g. `C:\Program Files\MySQL\MySQL Server 8.4\bin`) to PATH

2. **Option B: Chocolatey**
   ```cmd
   choco install mysql --version=8.4
   ```

#### Starting MySQL Service

**For Mac:**
Run `brew services start mysql`

**For Windows users:**

```cmd
# Start MySQL service
net start mysql84

# Or if installed via Chocolatey:
net start mysql
```

##For prod database
In `steam-app/server`:

```
npm run db:setup:prod
```

Create a `.env` file under `steam-app/server` and add the following lines:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=steam_prod
```

To verify you have set up the database correctly, run `mysql -uroot -p` and hit enter again (empty password). Run `use steam_prod; show tables; describe games;` and you should get the following output:

```
Database changed
+-----------------+
| Tables_in_steam |
+-----------------+
| games           |
+-----------------+
1 row in set (0.00 sec)

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
11 rows in set (0.00 sec)
```

Then, run `npm run dev` in both `steam-app/server` and `steam-app/web`. You should be able to open the webpage and see a basic UI.

##For sample database
In `steam-app/server`:

```
npm run db:setup:sample
```

Create a `.env` file under `steam-app/server` and add the following lines:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=steam
```

To verify you have set up the database correctly, run `mysql -uroot -p` and hit enter again (empty password). Run `use steam; show tables; describe games;` and you should get the following output:

```
Database changed
+----------------------+
| Tables_in_steam_prod |
+----------------------+
| descriptors          |
| developers           |
| game_details         |
| game_developer       |
| game_scores          |
| games                |
+----------------------+
6 rows in set (0.01 sec)

+--------------+---------------+------+-----+---------+-------+
| Field        | Type          | Null | Key | Default | Extra |
+--------------+---------------+------+-----+---------+-------+
| app_id       | bigint        | NO   | PRI | NULL    |       |
| name         | varchar(255)  | NO   |     | NULL    |       |
| price        | decimal(10,2) | NO   | MUL | NULL    |       |
| header_image | text          | YES  |     | NULL    |       |
| score        | int           | YES  |     | NULL    |       |
| description  | text          | YES  |     | NULL    |       |
+--------------+---------------+------+-----+---------+-------+
6 rows in set (0.01 sec)
```

Then, run `npm run dev` in both `steam-app/server` and `steam-app/web`. You should be able to open the webpage and see a basic UI.

![](https://media.discordapp.net/attachments/1420115967857660007/1430379936237092935/Screenshot_2025-10-21_at_10.19.09_PM.png?ex=68f9909f&is=68f83f1f&hm=8f4a274a4fddb2c25827782312d1963df7e6a453e0d7c97354c5ab479d5a92f4&=&format=webp&quality=lossless&width=1863&height=856)
