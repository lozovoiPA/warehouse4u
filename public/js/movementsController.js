const { pool } = require('../../db');

const getMovements = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Некорректный идентификатор склада' });
    }

    try {
        const { rows } = await pool.query(
            `
            SELECT 
                m.*,
                p.name AS product_name
            FROM movements m
            JOIN products p ON p.id = m.product_id
            WHERE 
                m.out_warehouse_id = $1 
                OR m.in_warehouse_id = $1
            ORDER BY m.date DESC;
            `,
            [id]
        );
        //console.log(rows);
        res.status(200).json(rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Не удалось получить список движений',
            error: error.message
        });
    }
};

const createMovement = async (req, res) => {
    try {
        const { 
            out_warehouse_id, 
            in_warehouse_id, 
            product_id, 
            quantity, 
            date, 
            operator 
        } = req.body;

        if (!out_warehouse_id || !in_warehouse_id || !product_id || !quantity || !date || !operator) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        const { rows } = await pool.query(
            `
            INSERT INTO movements (out_warehouse_id, in_warehouse_id, product_id, quantity, date, operator)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [out_warehouse_id, in_warehouse_id, product_id, quantity, date, operator]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: 'Не удалось создать движение',
            error: error.message
        });
    }
};

module.exports = {
    getMovements,
    createMovement
}