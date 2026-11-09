const xlsx = require("json-as-xlsx");

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
            RETURNING *
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

const generateStockReport = async (req, res) => {
    try {
        const { warehouseIds, categories } = req.body;

        const whFilter = (warehouseIds && warehouseIds.length > 0) ? warehouseIds : null;
        const catFilter = (categories && categories.length > 0) ? categories : null;

        let query = `
            SELECT 
                w.name AS warehouse_name,
                p.sku AS product_sku,
                p.name AS product_name,
                p.category AS product_category,
                si.quantity
            FROM stock_items si
            JOIN products p ON p.id = si.product_id
            JOIN warehouses w ON w.id = si.warehouse_id
            WHERE 1=1
        `;
        
        const values = [];
        let paramIndex = 1;

        if (whFilter) {
            query += ` AND si.warehouse_id = ANY($${paramIndex})`;
            values.push(whFilter);
            paramIndex++;
        }

        if (catFilter) {
            query += ` AND p.category = ANY($${paramIndex})`;
            values.push(catFilter);
            paramIndex++;
        }

        query += ` ORDER BY w.id ASC, p.id ASC;`;

        const { rows } = await pool.query(query, values);

        //const rows = [reportData];
        const columns = [
                { label: "Склад", value: "warehouse_name" },
                { label: "Артикул", value: "product_sku" },
                { label: "Товар", value: "product_name" },
                { label: "Категория", value: "product_category" },
                { label: "Количество", value: "quantity" }
            ];

        const dataToExport = [
            {
                sheet: "Остатки",
                columns: columns,
                content: rows
            }
        ];

        const settings = {
            fileName: "Отчет_по_остаткам",
            writeMode: "write",
            writeOptions: {
                type: "buffer",
                bookType: "xlsx"
            }
        };

        const buffer = xlsx(dataToExport, settings);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="stock_report.xlsx"');
        res.status(200).send(buffer);

        //res.status(200).json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Не удалось сгенерировать отчет',
            error: error.message
        });
    }
};

module.exports = {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    generateStockReport
}