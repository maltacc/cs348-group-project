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

# Or if neither of those work, open the 'services' system app, find MySQL<version>, right click and start
```

## For the Production Database

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

To verify you have set up the database correctly, run `mysql -uroot -p` and hit enter again (empty password). Run `use steam_prod/steam; show tables; describe games;` and you should get the following output:

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
## For the Sample Database

In `steam-app/server`:

```
npm run db:setup:sample
```

Create a `.env` file under `steam-app/server` and add the following lines:

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=steam_sample
```

To verify you have set up the database correctly, run `mysql -uroot -p` and hit enter again (empty password). Run `use steam_sample; show tables; describe games;` and you should get the following output:

```
Database changed
+------------------------+
| Tables_in_steam_sample |
+------------------------+
| descriptors            |
| developers             |
| game_details           |
| game_developer         |
| game_scores            |
| games                  |
+------------------------+
6 rows in set (0.001 sec)

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
6 rows in set (0.015 sec)
```

Then, run `npm run dev` in both `steam-app/server` and `steam-app/web`. You should be able to open the webpage and see a basic UI.

![](https://media.discordapp.net/attachments/779019590210027560/1439005638306037824/Screenshot_2025-11-14_at_4.34.35_PM.png?ex=6918f1ef&is=6917a06f&hm=7dec610b964675e91b2e2ac74d25fe692349c1fadc5a6352de9a808aea2e2e56&=&format=webp&quality=lossless&width=1100&height=576)
