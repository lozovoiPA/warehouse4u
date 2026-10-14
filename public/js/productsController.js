const { pool } = require('../../db');

const getProducts = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM products'
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'Не удалось получить список товаров',
            error: error.message
        });
    }
};

const getProductCategories = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT name FROM product_categories'
        );
        res.json(rows.map(r => r.name));
    } catch(error) {
        res.status(500).json({
            message: 'Не удалось получить список категорий товаров',
            error: error.message
        });
    }
}

const getProductUnits = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT name FROM product_units'
        );
        res.json(rows.map(r => r.name));
    } catch(error) {
        res.status(500).json({
            message: 'Не удалось получить список единиц измерения товаров',
            error: error.message
        });
    }
}

const createProduct = async (req, res) => {
    try {
        console.log(req.body);
        const { name, category, units } = req.body;
        const { rows } = await pool.query(
            `
            INSERT INTO products (name, category, unit) VALUES
                ($1, $2, $3)
            `,
            [name, category, units]
        )
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(400).json({
            message: 'Не удалось создать пользователя',
            error: error.message
        });
    }
}

module.exports = {
    getProducts,
    getProductCategories,
    getProductUnits,
    createProduct
}