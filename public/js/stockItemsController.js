const { pool } = require('../../db');

const getStockItems = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Некорректный идентификатор склада' });
    }

    try {
        const { rows } = await pool.query(
            `
            SELECT 
                si.*,
                p.name AS product_name,
                p.sku AS product_sku,
                p.id AS product_id
            FROM stock_items si
            JOIN products p ON p.id = si.product_id
            WHERE 
                si.warehouse_id = $1 
            ORDER BY p.id ASC;
            `,
            [id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Не удалось получить список товаров на складе',
            error: error.message
        });
    }
};

const createStockItem = async (req, res) => {
    try {
        const warehouse_id = Number(req.params.id);
        if (!Number.isInteger(warehouse_id)) {
            return res.status(400).json({ message: 'Некорректный идентификатор склада' });
        }
        const { product_id, quantity } = req.body;
        const { rows } = await pool.query(
            `
            INSERT INTO stock_items (product_id, warehouse_id, quantity) VALUES
                ($1, $2, $3)
            RETURNING *
            `,
            [product_id, warehouse_id, quantity]
        )
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(400).json({
            message: 'Не удалось создать остаток',
            error: error.message
        });
    }
}

module.exports = {
    getStockItems,
    createStockItem
}