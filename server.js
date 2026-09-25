const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Конфиги из .env
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const DB_CONF = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'warehouse4u_db'
}

// Пул подключений к БД
const pool = mysql.createPool({
    host: DB_CONF.host,
    user: DB_CONF.user,
    password: DB_CONF.password,
    database: DB_CONF.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Подключаем статические файлы
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/catalogue', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalogue.html'));
});

// API
app.get('/api/products', async (req, res) => {
  const [rows] = await pool.promise().query('SELECT * FROM products');
  res.json(rows);
});
// 204 и 404
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use((req, res, next) => { 
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Запуск
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
