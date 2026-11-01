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

module.exports = {
    getMovements
}