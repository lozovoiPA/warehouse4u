let warehousesList = [];
let currentWarehouseId = null;

function getWarehouseName(id) {
    const wh = warehousesList.find(w => w.id === id);
    return wh ? wh.name : `#${id}`;
}


function loadWarehouses() {
    fetch('/api/warehouses')
        .then(res => res.json())
        .then(warehouses => {
            warehousesList = warehouses;
            const tbody = document.querySelector('#warehousesTable tbody');

            if (warehouses.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">Нет складов.</td></tr>';
                return;
            }

            tbody.innerHTML = warehouses.map((w, i) => `
                <tr class="warehouse-row" data-id="${w.id}" onclick="selectWarehouse(${w.id})">
                    <td>${w.name ?? "Не указано"}</td>
                    <td class="row-edit-cell">
                        ${w.address ?? "Не указано"}
                        <div class="row-hover"></div>
                        <div class="row-edit">
                            <button type="button" title="Редактировать" onclick="event.stopPropagation(); editWarehouse(${i})">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            if (warehouses.length > 0) {
                selectWarehouse(warehouses[0].id);
            }
        })
        .catch(err => console.error(err));
}

function selectWarehouse(id) {
    currentWarehouseId = id;

    document.querySelectorAll('#warehousesTable tbody tr').forEach(row => {
        row.classList.toggle('active', Number(row.dataset.id) === id);
    });

    loadStockItems(id);
    loadMovements(id);
}


function loadStockItems(warehouseId) {
    const tbody = document.querySelector('#stockItemsTable tbody');
    tbody.innerHTML = '<tr><td colspan="3">Загрузка...</td></tr>';

    fetch(`/api/warehouses/${warehouseId}/stock`)
        .then(res => res.json())
        .then(items => {
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">На складе нет товаров.</td></tr>';
                return;
            }
            tbody.innerHTML = items.map(item => `
                <tr>
                    <td>${item.product_sku ?? "Не указано"}</td>
                    <td>${item.product_name ?? "Не указано"}</td>
                    <td>${item.quantity ?? "Не указано"}</td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="3">Ошибка загрузки остатков.</td></tr>';
        });
}

function loadMovements(warehouseId) {
    const tbody = document.querySelector('#movementsTable tbody');
    tbody.innerHTML = '<tr><td colspan="6">Загрузка...</td></tr>';

    fetch(`/api/warehouses/${warehouseId}/movements`)
        .then(res => res.json())
        .then(movements => {
            if (movements.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Нет движений.</td></tr>';
                return;
            }
            tbody.innerHTML = movements.map(m => `
                <tr>
                    <td>${m.product_name ?? "Не указано"}</td>
                    <td>${m.quantity ?? "Не указано"}</td>
                    <td>${getWarehouseName(m.out_warehouse_id)}</td>
                    <td>${getWarehouseName(m.in_warehouse_id)}</td>
                    <td>${m.operator ?? "Не указано"}</td>
                    <td>${formatDate(m.date)}</td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки движений.</td></tr>';
        });
}

function formatDate(isoString) {
    if (!isoString) return "Не указано";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Не указано";
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function editWarehouse(index) {
    console.log("Edit warehouse:", warehousesList[index]);
}

function loadWarehousesPage() {
    loadWarehouses();
}