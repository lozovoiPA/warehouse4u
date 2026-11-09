const express = require('express');
const path = require('path');

const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');

const app = express();

const productsController = require('./public/js/productsController');
const warehousesController = require('./public/js/warehousesController');
const stockItemsController = require('./public/js/stockItemsController');
const movementsController = require('./public/js/movementsController');

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
    res.sendFile(path.join(__dirname, 'public', 'warehouses.html'));
});
app.get('/catalogue', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalogue.html'));
});
app.get('/warehouses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'warehouses.html'));
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// API
// Получение всех товаров
app.get('/api/products', productsController.getProducts);
// Получение категорий из отдельной таблицы
app.get('/api/products/categories', productsController.getProductCategories);
// Получение единиц измерений
app.get('/api/products/units', productsController.getProductUnits);
// Создание товара
app.post('/api/products', productsController.createProduct);
// Обновление товара
app.put('/api/products/:id', productsController.updateProduct);
// Получение складов
app.get('/api/warehouses', warehousesController.getWarehouses);
// Получение остатков на складе
app.get('/api/warehouses/:id/stock', stockItemsController.getStockItems);
// Создание остатка на складе
app.post('/api/warehouses/:id/stock', stockItemsController.createStockItem);
// Получение движений со склада и на склад
app.get('/api/warehouses/:id/movements', movementsController.getMovements);
// Создание склада
app.post('/api/warehouses', warehousesController.createWarehouse);
// Обновление склада
app.put('/api/warehouses/:id', warehousesController.updateWarehouse);
// Создание движения
app.post('/api/movements', movementsController.createMovement);
// Создание отчета
app.post('/api/reports/stock', warehousesController.generateStockReport);

// 204 и 404
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use((req, res, next) => { 
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Запуск
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
