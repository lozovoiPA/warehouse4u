const pg = require('pg');
require('dotenv').config();

const DB_CONF = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'warehouse4u',
    port: process.env.DB_PORT || 5432
}

// Пул подключений к БД
const pool = new pg.Pool({
    host: DB_CONF.host,
    port: DB_CONF.port,
    user: DB_CONF.user,
    password: DB_CONF.password,
    database: DB_CONF.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    pool
};