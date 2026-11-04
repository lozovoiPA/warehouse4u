let warehousesList = [];
let currentStock = [];
let currentWarehouseId = null;
let warehouseFormMode = "create";
let editingWarehouse = null;

function getWarehouseName(id) {
    const wh = warehousesList.find(w => w.id === id);
    return wh ? wh.name : `#${id}`;
}

function queryElements() {
    // Получаем элементы (форма и ее задний фон)
    modalBackground = document.getElementById("modal-background");
    warehouseFormContainer = document.getElementById("warehouse-form"); // Контейнер формы
    warehouseFormFields = warehouseFormContainer.querySelector("form"); // Сама форма (все поля и подписи)
    // Поля формы
    warehouseName = document.getElementById("warehouse-name");
    warehouseAddress = document.getElementById("warehouse-address");

    warehouseFormTitle = warehouseFormContainer.querySelector("h2");
    warehouseFormSubmitButton = warehouseFormFields.querySelector('input[type="submit"]');


    movementFormContainer = document.getElementById("movement-form"); // Контейнер формы
    movementFormFields = movementFormContainer.querySelector("form"); // Сама форма (все поля и подписи)

    outWarehouseName = document.getElementById("out-warehouse-name");
    inWarehouseName = document.getElementById("in-warehouse-name");
    movementProductName = document.getElementById("movement-product-name");
    movementQuantity = document.getElementById("movement-quantity");
    movementDate = document.getElementById("movement-date");
    movementOperator = document.getElementById("movement-operator");

    movementFormSubmitButton = movementFormFields.querySelector('input[type="submit"]');
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
                            <button type="button" title="Редактировать" onclick="event.stopPropagation(); showWarehouseForm(warehousesList[${i}])">
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
            currentStock = items;
            fillMovementProductNames(0);
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
    //const d = new Date(isoString);
    const d = new Date(new Date(isoString).getTime() + new Date(isoString).getTimezoneOffset() * 60 * 1000);
    if (isNaN(d.getTime())) return "Не указано";
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function editWarehouse(index) {
    console.log("Edit warehouse:", warehousesList[index]);
}

function loadWarehousesPage() {
    queryElements();
    loadWarehouses();

    modalBackground?.addEventListener('click', (event) => { // Любое нажатие ВНЕ формы приводит к ее закрытию
        if (event.target === modalBackground) {
            closeAllForms();
        }
    });

    warehouseFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (warehouseFormMode === "edit") {
            const res = await fetch(`/api/warehouses/${editingWarehouse.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:     warehouseName.value.trim(),
                    address:  warehouseAddress.value.trim()
                })
            });
            if (!res.ok) {
                console.error("Warehouse PUT failed:", await res.json());
                return;
            }
            closeAllForms();
            await loadWarehouses();
            return;
        }

        const payload = {
            name:     warehouseName.value.trim(),
            address:  warehouseAddress.value.trim()
        };

        let req = { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        };
        let res = await fetch('/api/warehouses', req);

        closeAllForms();
        await loadWarehouses();
    });

    movementProductName?.addEventListener('change', (event) => {
        fillMovementQuantityRestrictions(event.target.value)
    });

    movementFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            out_warehouse_id: Number(outWarehouseName.value),
            in_warehouse_id: Number(inWarehouseName.value),
            product_id: Number(currentStock.find(x => x.id == movementProductName.value).product_id),
            quantity: Number(movementQuantity.value),
            date: movementDate.value,
            operator: movementOperator.value.trim()
        };

        try {
            const res = await fetch('/api/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Movement POST failed:", errorData);
                alert(errorData.message || 'Ошибка при создании отгрузки');
                return;
            }

            closeAllForms();
            
            await loadStockItems(currentWarehouseId);
            await loadMovements(currentWarehouseId);

        } catch (err) {
            console.error("Network error:", err);
        }
    });
}

function showWarehouseForm(warehouse = null) {
    warehouseFormFields.reset();
    if (warehouse) {
        warehouseFormMode = "edit";
        editingWarehouse = warehouse;
        warehouseFormTitle.textContent = "Редактирование информации о складе";
        warehouseFormSubmitButton.value = "Сохранить";
        warehouseName.value = warehouse.name ?? "";
        warehouseAddress.value = warehouse.address ?? "";
    } else {
        warehouseFormMode = "create";
        editingWarehouse = null;
        warehouseFormTitle.textContent = "Добавление новой точки";
        warehouseFormSubmitButton.value = "Создать";
    }
    modalBackground.classList.toggle("not-visible");
    warehouseFormContainer.classList.toggle("not-visible");
}

function showMovementForm() {
    movementFormFields.reset();

    outWarehouseName.innerHTML = `<option value="${currentWarehouseId}">${getWarehouseName(currentWarehouseId)}</option>`;
    inWarehouseName.innerHTML = warehousesList.filter(x => x.id != currentWarehouseId).map(c =>
                `<option value="${c.id}">${c.name}</option>`
            ).join('');
   // fillMovementProductNames(currentWarehouseId)
    movementDate.value = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString().slice(0, -8)

    modalBackground.classList.toggle("not-visible");
    movementFormContainer.classList.toggle("not-visible");
}

function fillMovementProductNames(warehouseId) {
    try {
        if (currentStock.length === 0) {
            movementProductName.innerHTML = `<option value=""><На складе нет товаров></option>`
            movementProductName.disabled = true;
            movementFormSubmitButton.disabled = true;
            return;
        }
        movementProductName.innerHTML = currentStock.map(item => `
            <option value="${item.id}">${item.product_sku} | ${item.product_name}</option>
        `).join('');
        fillMovementQuantityRestrictions(currentStock[0].id)
        movementProductName.disabled = false;
        movementFormSubmitButton.disabled = false;
    }
    catch (err) {
        console.error(err);
        movementProductName.innerHTML = `<option value=""><Возникла ошибка при получении товаров></option>`
        movementProductName.disabled = true;
        movementFormSubmitButton.disabled = true;
    }
}

function fillMovementQuantityRestrictions(stockItemId) {
    var stockItem = currentStock.find(x => x.id == stockItemId)
    if(stockItem == undefined) {
        console.log('item not found in stock')
        return
    }
    console.log(`chosen stock item: ${stockItem.product_sku} (up to ${stockItem.quantity}, id: ${stockItem.product_id})`)
    movementQuantity.min = `1`
    movementQuantity.max = `${stockItem.quantity}`
}

function closeAllForms() {
    modalBackground.classList.toggle("not-visible");
    warehouseFormContainer.classList.add("not-visible");
    movementFormContainer.classList.add("not-visible");
}
