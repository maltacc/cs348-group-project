# cs348-group-project
setup
go into steam-app/server and web seperately and run npm i for both and let it do its thing. to ensure that everything is running properly run: npm run dev on both frontend and backend and you should be able to see a UI and have two network errors

for the database make sure you have mysql installed (brew mysql@8.4) then run mysql -uroot < migrations/initial.sql to get the db setup locally. then to ensure that everything is all good run mysql in the cli then:
use steam;
show tables;
describe games;

and you should see some popups in the cli. and that should be everything for now (the database is empty)