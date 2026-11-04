const { pool } = require('../../db');

const getWarehouses = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM warehouses ORDER BY id ASC'
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({
            message: 'Не удалось получить список складов',
            error: error.message
        });
    }
};

const createWarehouse = async (req, res) => {
    try {
        const { name, address} = req.body;
        const { rows } = await pool.query(
            `
            INSERT INTO warehouses (name, address) VALUES
                ($1, $2)
            `,
            [name, address]
        )
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(400).json({
            message: 'Не удалось создать склад',
            error: error.message
        });
    }
}

const updateWarehouse = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Некорректный идентификатор склада' });
    }

    const { name, address } = req.body;
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Наименование склада обязательно' });
    }
    if (typeof address !== 'string' || address.trim() === '') {
        return res.status(400).json({ message: 'Адрес склада обязателен' });
    }

    try {
        const { rows } = await pool.query(
            `
            UPDATE warehouses
            SET name = $1, address = $2
            WHERE id = $3
            RETURNING *
            `,
            [name.trim(), address.trim(), id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Склад не найден' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(400).json({
            message: 'Не удалось обновить информацию о складе',
            error: error.message
        });
    }
}

module.exports = {
    getWarehouses,
    createWarehouse,
    updateWarehouse
}