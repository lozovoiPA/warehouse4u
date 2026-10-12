const express = require('express');
const path = require('path');

const app = express();

// Конфиги из .env
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const { pool, checkConstraintQuery } = require('./db');

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
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
});

var extractAllowedValues = function(def) {
    const matches = def.match(/'([^']*)'/g) || [];
    return matches.map(s => s.slice(1, -1));
}

app.get('/api/products/categories', async (req, res) => {
    const { rows } = await pool.query(checkConstraintQuery);
    if (rows.length === 0) {
        return res.json([]);
    }
    const categories = extractAllowedValues(rows.flatMap(r => r.check_constraints)[0]);
    res.json(categories);
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
