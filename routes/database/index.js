var { Pool } = require('pg');
var dotenv = require('dotenv');

dotenv.config();

var pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.dbport
});

module.exports = pool;