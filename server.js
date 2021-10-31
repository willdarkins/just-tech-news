/* Since we set up the routes the way we did, we don't have to worry about importing multiple files for different endpoints.
The router instance in routes/index.js collected everything for us and packaged them up for server.js to use.*/

/*Also, note we're importing the connection to Sequelize from config/connection.js.
Then, at the bottom of the file, we use the sequelize.sync() method to establish
the connection to the database. The "sync" part means that this is Sequelize taking
the models and connecting them to associated database tables.
If it doesn't find a table, it'll create it for you!*/

const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// turn on routes
app.use(routes);

// turn on connection to db and server
/*This doesn't have to be included, but if it were set to true, 
it would drop and re-create all of the database tables on startup.*/
sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => console.log('Now listening'));
});
