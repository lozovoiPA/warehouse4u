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
            message: 'Не удалось создать товар',
            error: error.message
        });
    }
}

const updateProduct = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Некорректный идентификатор товара' });
    }

    const { name, category, units } = req.body;
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Наименование товара обязательно' });
    }

    try {
        // category и unit перезаписываются как есть (null = "Не указано")
        const { rows } = await pool.query(
            `
            UPDATE products
            SET name = $1, category = $2, unit = $3
            WHERE id = $4
            RETURNING *
            `,
            [name.trim(), category ?? null, units ?? null, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(400).json({
            message: 'Не удалось обновить товар',
            error: error.message
        });
    }
}

module.exports = {
    getProducts,
    getProductCategories,
    getProductUnits,
    createProduct,
    updateProduct
}