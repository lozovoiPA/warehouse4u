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

const checkConstraintQuery = `
    SELECT pg_get_constraintdef(c.oid) AS check_constraints
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.contype = 'c'
      AND n.nspname = 'public'
      AND t.relname = 'products'
      AND c.conname = 'chk_category';
`;

module.exports = {
    pool,
    checkConstraintQuery
};