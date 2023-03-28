const { Sequelize } = require('sequelize');
const config = require('./config.json'); // getting config from json-file
const pg = require('pg');
const confenv = config.development; // to set an using environment (dev / test / prod)

module.exports = new Sequelize({
    database: confenv.database,
    username: confenv.username,
    password: confenv.password,
    host: confenv.host,
    dialect: confenv.dialect,
    dialectModule: pg,
});
