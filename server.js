const express = require('express');
const path = require('path');

const app = express();
const productsController = require('./public/js/productsController');

// Конфиги из .env
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Подключаем статические файлы
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Подключение обработки JSON запросов
app.use(express.json());

// Страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/catalogue', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalogue.html'));
});

// API
// Получение всех товаров
app.get('/api/products', productsController.getProducts);
// Получение категорий из отдельной таблицы
app.get('/api/products/categories', productsController.getProductCategories);
// Получение единиц измерений
app.get('/api/products/units', productsController.getProductUnits);
// Создание товара
app.post('/api/products', productsController.createProduct);

// 204 и 404
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use((req, res, next) => { 
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Запуск
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
