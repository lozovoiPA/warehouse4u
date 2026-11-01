const { pool } = require('../../db');

const getWarehouses = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM warehouses'
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'Не удалось получить список складов',
            error: error.message
        });
    }
};

module.exports = {
    getWarehouses
}